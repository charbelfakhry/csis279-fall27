import { getToken } from "./apiFetch";

// runs a request, and fails if the session changed before the answer arrived
const forSession = async (request) => {
    const token = getToken();
    const result = await request();

    if (getToken() !== token) {
        throw new Error("The session ended");
    }

    return result;
}

export default forSession;
