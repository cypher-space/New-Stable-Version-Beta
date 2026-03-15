<script setup>
const rates = await useBtcRates("GBP");
const btcprices =
  rates.btcPerFiat > 0 ? (1 / rates.btcPerFiat).toFixed(2) : "0.00";
</script>
<template>
  <div>
    <p
      class="text-xs leading-5 text-black dark:text-black dark:text-white mt-12 block text-center"
    >
      Bitcoin Ticker: £ {{ btcprices }}
    </p>
  </div>
</template>
