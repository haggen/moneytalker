import { useEffect, useRef } from "react";
import { useLiveRef } from "~/src/lib/useLiveRef";
import { useIsMounted } from "~/src/lib/useIsMounted";

export function useInterval(callback, interval) {
  const isMounted = useIsMounted();
  const callbackRef = useLiveRef(callback);
  const intervalRef = useRef();

  useEffect(() => {
    if (intervalRef.current) {
      return;
    }

    intervalRef.current = setInterval(() => {
      if (!isMounted()) {
        clearInterval(intervalRef.current);
        return;
      }

      callbackRef.current();
    }, interval);
  });
}
