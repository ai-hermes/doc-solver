import { useEffect, useRef } from "react";

export function usePollingEffect(
    asyncCallback: () => Promise<void>,
    dependencies: unknown[] = [],
    {
        interval = 1000,
        onCleanUp = () => { }
    } = {},
) {
    const timeoutIdRef = useRef<NodeJS.Timeout | null>(null)
    useEffect(() => {
        let _stopped = false
            // Side note: preceding semicolon needed for IIFEs.
            ; (async function pollingCallback() {
                try {
                    await asyncCallback()
                } finally {
                    timeoutIdRef.current = !_stopped && setTimeout(
                        pollingCallback,
                        interval
                    );
                }
            })()
        // Clean up if dependencies change
        return () => {
            _stopped = true // prevent racing conditions
            if (timeoutIdRef.current) {
                clearTimeout(timeoutIdRef.current)
            }
            onCleanUp()
        }
    }, [...dependencies, interval])
}