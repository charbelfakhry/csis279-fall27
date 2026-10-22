import { useCallback, useEffect, useState } from "react";

const useFetch = (fetchFn, initialData = []) => {
    const [data, setData] = useState(initialData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const reload = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const result = await fetchFn();
            setData(result);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, [fetchFn]);

    useEffect(() => {
        let cancelled = false;

        const loadInitialData = async () => {
            try {
                const result = await fetchFn();
                if (!cancelled) {
                    setData(result);
                    setError("");
                }
            } catch (error) {
                if (!cancelled) {
                    setError(error.message);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadInitialData();

        return () => {
            cancelled = true;
        }
    }, [fetchFn])

    return { data, loading, error, setError, reload };
}

export default useFetch;
