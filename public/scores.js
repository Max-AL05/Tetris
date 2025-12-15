window.onload = () => {
    const scoresBody = document.getElementById('scores-body');
    const scoresTable = document.getElementById('scores-table');
    const loadingText = document.getElementById('loading-text');

    // Pedir datos al backend
    fetch('/api/scores')
        .then(response => response.json())
        .then(data => {
            loadingText.style.display = 'none';
            scoresTable.style.display = 'table';

            // Limpiar tabla por si acaso
            scoresBody.innerHTML = '';

            // Generar filas
            if (data.length === 0) {
                scoresBody.innerHTML = '<tr><td colspan="4">Aún no hay puntuaciones</td></tr>';
                return;
            }

            // ... dentro del fetch ...
            data.forEach((entry, index) => {
                const row = document.createElement('tr');

                let rankClass = '';
                if (index === 0) rankClass = 'rank-1';
                else if (index === 1) rankClass = 'rank-2';
                else if (index === 2) rankClass = 'rank-3';

                row.innerHTML = `
                    <td class="${rankClass}">${index + 1}</td>
                    <td class="${rankClass}">${entry.Nombre}</td> 
                    <td class="${rankClass}">${entry.Puntaje}</td>
                    <td>${entry.Lineas}</td>
                `;
                scoresBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error:', error);
            loadingText.innerText = "Error al cargar puntuaciones.";
        });
};