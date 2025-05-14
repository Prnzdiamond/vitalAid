<script setup>

const router = useRouter();

// Redirect to /dashboard on load
onMounted(() => {
  router.push('/dashboard');
});
</script>
