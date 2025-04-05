const datos = [
  {
    titulo: "Bicampeón JJBB y Subcampeon Nacional BA Gaming",
    descripcion:
      "Fui jugador durante mucho tiempo de League of Legends y logre junto a mi equipo ser campeónes en las ediciones 2021 y 2023 representando a mi ciudad Chacabuco de los Juegos Bonaerenses y en 2024 logramos llegar en el torneo nacional mas importante a nivel amateur a las finales de la BA Gaming, una experiencia inolvidable.",
    imagen: "assets/img/jbcampeones.webp",
  },
  {
    titulo: "Mi animal favorito",
    descripcion:
      "Me encantan los osos, me parecen animales increibles los cuales admiro, y porque tambien de niño mi pelicula favorita fue Tierra de Osos. Face reveal: yes, I'm a bear.",
    imagen: "assets/img/oso3.jpeg",
  },
  {
    titulo: "Futbol",
    descripcion:
      "Desde que mi abuela me puso la casaca del ciclon, los colores traspasaron mi piel y tiñeron mi corazon. Mi cancion favorita, pasaron 100 años",
    imagen: "assets/img/san-lorenzojpg.webp",
  },
];

function mostrarContenido(index) {
  const contenedor = document.getElementById("contenido-personal");

  contenedor.classList.remove("show");

  setTimeout(() => {
    document.getElementById("titulo").textContent = datos[index].titulo;
    document.getElementById("descripcion").textContent =
      datos[index].descripcion;
    document.querySelector("#contenido-personal img").src = datos[index].imagen;
    contenedor.classList.add("show");
  }, 400);
}
let index = 0;

document.getElementById("siguiente").addEventListener("click", () => {
  index = (index + 1) % datos.length;
  mostrarContenido(index);
});

document.getElementById("anterior").addEventListener("click", () => {
  index = (index - 1 + datos.length) % datos.length;
  mostrarContenido(index);
});

mostrarContenido(index);
