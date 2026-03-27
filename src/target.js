import { useRef, useEffect } from 'react';

let currentTarget;

export const getCurrentTarget = () => {
    return currentTarget;
}

export const setCurrentTarget = (target) => {
    currentTarget = target;
}

