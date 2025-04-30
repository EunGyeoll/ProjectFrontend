<template>
  <nav class="navbar navbar-expand-lg navbar-light">
    <div class="container">
      <router-link class="navbar-brand" to="/">카테고리</router-link>
      <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav">
          <li class="nav-item">
            <router-link class="nav-link" to="/">커뮤니티</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/">찜한 상품</router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>


<script>
export default {
  name: 'NavBar',
};
</script>

<style scoped>
.navbar {
  margin-bottom: 10px;
  border-bottom: 1px solid #ddd; 
}
</style>
