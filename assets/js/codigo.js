const CHAMPIONS_API_URL = 'https://championsbattledata.com/api/v1/pokemon';

function createTypeBoxes(typesArray) {
    return typesArray.map(typeInfo => {
        const typeName = typeInfo.type.name;
        return `
            <div class="badge rounded-2 bg-type-${typeName} px-3 py-2 text-uppercase fw-bold me-1 shadow-sm">
                ${typeName}
            </div>
    `;
    }).join('');
}

function getStatColorClass(val) {
    if (val < 60) {
        return 'bg-danger';
    } else if (val < 90) {
        return 'bg-warning';
    } else {
        return 'bg-success';
    }
}