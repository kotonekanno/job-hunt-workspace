import { useEffect, useRef, useState } from 'react';
import { useBlocker } from 'react-router-dom';
import { DocumentSaveSession } from '@/features/documents/lib/documentSaveSession';
import { saveCompanyDocument } from '@/features/companies/lib/companyDetailApi';
import { toast } from '@/shared/toast';

export function useCompanyDocument(companyId: number, initialText: string) {
  const [text, setText] = useState(initialText);
  const [initial] = useState(initialText);
  const [state, setState] = useState({ dirty: false, saving: false });
  const session = useRef<DocumentSaveSession | null>(null);
  useEffect(() => {
    const current = new DocumentSaveSession(
      initial,
      (value) => saveCompanyDocument(companyId, value),
      () => setState({ dirty: current.dirty, saving: current.saving }),
      toast.error,
    );
    session.current = current;
    return () => {
      current.dispose();
    };
  }, [companyId, initial]);
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      currentLocation.pathname !== nextLocation.pathname &&
      (session.current?.dirty ?? false),
  );
  const navigating = useRef(false);
  useEffect(() => {
    if (blocker.state !== 'blocked' || navigating.current) return;
    navigating.current = true;
    void session.current?.flush().then((saved) => {
      navigating.current = false;
      if (saved) blocker.proceed();
      else blocker.reset();
    });
  }, [blocker]);
  useEffect(() => {
    function beforeUnload(event: BeforeUnloadEvent) {
      if (!session.current?.dirty) return;
      event.preventDefault();
      event.returnValue = '';
    }
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, []);
  return {
    text,
    ...state,
    blocked: blocker.state === 'blocked',
    update: (value: string) => {
      setText(value);
      session.current?.update(value);
    },
    save: () => session.current?.flush() ?? Promise.resolve(false),
  };
}
