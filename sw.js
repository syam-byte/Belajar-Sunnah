
<script>
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration =
        await navigator.serviceWorker.register('./sw.js');

      await navigator.serviceWorker.ready;

      if (navigator.storage &&
          navigator.storage.persist) {
        navigator.storage.persist().then(granted => {
          console.log('Penyimpanan permanen:', granted);
        });
      }

      console.log('Belajar Sunnah Offline aktif.');

    } catch (error) {
      console.error('Offline gagal diaktifkan:', error);
    }
  });
}
</script>
