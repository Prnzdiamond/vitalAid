export const useToken = () => {
    return {
        get: () => {
            if (process.client) {
                return JSON.parse(localStorage.getItem("token") || '""').replace(/^"|"$/g, "") || null;
            }
            return null;
        },
        set: (token) => {
            if (process.client) {
                localStorage.setItem('token', token);
            }
        },
        remove: () => {
            if (process.client) {
                localStorage.removeItem('token');
            }
        }
    };
};
