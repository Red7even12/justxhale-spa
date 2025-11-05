<template>
  <!-- 
    The hardcoded class has been removed. 
    Instead, we are now binding the class attribute to the prop we receive.
  -->
  <img src="./Vizabiliti_Logo2_Rounded.svg" alt="Vizabiliti Logo" :class="props.class">
</template>

<script setup>
// This defines that our component can accept a "class" property from its parent.
const props = defineProps({
  class: String
});
</script>