import Echo from "laravel-echo";
import Pusher from "pusher-js";

export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig();

    window.Pusher = Pusher;
    window.Echo = new Echo({
        broadcaster: "pusher",
        key: config.public.reverbAppKey,
        wsHost: config.public.reverbHost,
        wsPort: config.public.reverbPort,
        forceTLS: false,
        disableStats: true,
        enabledTransports: ["ws", "wss"],
        authEndpoint: config.public.apiBase + "/broadcasting/auth", // ✅ Fix auth endpoint
        auth: {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`, // ✅ Ensure the token is passed
            },
        },
        cluster: ""
    });
});
