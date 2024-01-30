import { useRef, useEffect } from "react";

export function useLiveRef(value) {
  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = value;
  });

  return valueRef;
}
