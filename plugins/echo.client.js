// ~/plugins/echo.client.js
import Echo from "laravel-echo";
import Pusher from "pusher-js";

// Initialize Echo with the provided token
const initEcho = (token) => {
    const config = useRuntimeConfig();

    console.log("🧪 initEcho CALLED WITH:", token, typeof token);


    window.Pusher = Pusher;
    window.Echo = new Echo({
        broadcaster: "pusher",
        key: config.public.reverbAppKey,
        wsHost: config.public.reverbHost,
        wsPort: config.public.reverbPort,
        forceTLS: false,
        disableStats: true,
        enabledTransports: ["ws", "wss"],
        cluster: "",

        authEndpoint: config.public.apiBase + "/broadcasting/auth",
        auth: {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    });
};

// Exporting the initEcho function as default export
export default initEcho;
