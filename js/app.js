const select = document.getElementById("peserta");

getPeserta().forEach((nama)=>{

    select.innerHTML += `
        <option value="${nama}">
            ${nama}
        </option>
    `;

});