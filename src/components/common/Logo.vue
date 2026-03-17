<template>
  <!-- 
    The hardcoded class has been removed. 
    Instead, we are now binding the class attribute to the prop we receive.
  -->
  <img src="./justxhale_logo_whitebg.svg" alt="Just Xhale Logo" :class="props.class">  
</template>

<script setup>
// This defines that our component can accept a "class" property from its parent.
const props = defineProps({
  class: String
});
</script>