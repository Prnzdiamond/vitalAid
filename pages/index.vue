<script setup>
definePageMeta({
  middleware: 'auth' // optional: only if dashboard requires auth
});

const router = useRouter();

// Redirect to /dashboard on load
onMounted(() => {
  router.push('/dashboard');
});
</script>
