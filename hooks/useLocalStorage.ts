import { useState, useEffect } from 'react';

function getValue<T>(key: string, defaultValue: T): T {
    const saved = localStorage.getItem(key);
    if (saved) {
        return JSON.parse(saved) as T;
    }
    return defaultValue;
}

export function useLocalStorage<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [value, setValue] = useState<T>(
        () => getValue(key, defaultValue)
    );

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    return [value, setValue];
}