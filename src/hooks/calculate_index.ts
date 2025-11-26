import { fetchExercisesPorUnidad } from '@/data/unidades.ts';
import { getUnitIndex } from '@/data/unidades.ts';

let INDECES = {};
let POSICIONES = null;

export async function Calculate_index_exercise(Exercise: any) {
    try {
        if (POSICIONES === null) {
            POSICIONES = await fetchExercisesPorUnidad();
        }

        if (INDECES[Exercise.unidad] === undefined) {
            const index = Number(Exercise.unidad) > 1 ? Number(Exercise.unidad).toString() : (Number(Exercise.unidad) + 1).toPrecision(1).toString();
            INDECES[Exercise.unidad] = await getUnitIndex(index);
        }
        const startIndex = POSICIONES.unidades[Exercise.unidad].startIndex;
        const ExerciseIndex = INDECES[Exercise.unidad].items.filter((item : any) => item._id === Exercise._id)[0].indicePosition;
        return startIndex + ExerciseIndex;
    } catch (e) {
        console.error("Error calculating index for exercise", Exercise, e);
        return -1;
    }
}