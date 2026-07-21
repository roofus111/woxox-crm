import { useState, useEffect, useRef } from "react";

export default function useFakeProgress(speed = 100) {
    const [progress, setProgress] = useState(-1); // -1 means indeterminate
    const timerRef = useRef(null);

    const start = () => {
        setProgress(0);
        if (timerRef.current) clearInterval(timerRef.current);

        timerRef.current = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(timerRef.current);
                    return 100;
                }
                return prev + 3;
            });
        }, speed);
    };

    const reset = () => {
        clearInterval(timerRef.current);
        setProgress(-1);
    };

    useEffect(() => {
        return () => clearInterval(timerRef.current);
    }, []);

    return { progress, start, reset };
}
