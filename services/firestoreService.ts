import { collection } from "firebase/firestore";
import { db } from "@/lib/firebase";

// students/{studentId}
// {
//   name: string,
//   email: string,
//   busId: string
// }
export const studentsCollection = db ? collection(db, "students") : null;

// buses/{busId}
// {
//   busNumber: string,
//   routeName: string,
//   coordinatorName?: string
// }
export const busesCollection = db ? collection(db, "buses") : null;
