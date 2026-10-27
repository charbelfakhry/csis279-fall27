import { useState } from "react";

// runs an async action, tracking pending state and reporting errors via setError
const useAsyncAction = (setError) => {
    const [pending, setPending] = useState(false);

    const run = async (action) => {
        try {
            setPending(true);
            setError("");
            await action();
        } catch (error) {
            setError(error.message);
        } finally {
            setPending(false);
        }
    }

    return { run, pending };
}

export default useAsyncAction;
