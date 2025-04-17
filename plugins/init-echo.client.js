// ~/plugins/init-echo.client.js
import initEcho from "~/plugins/echo.client";

export default defineNuxtPlugin(() => {
    if (process.client) {
        const token = localStorage.getItem("token");
        if (token) {
            initEcho(token); // Initialize Echo with the token
        }
    }
});
