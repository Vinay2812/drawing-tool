import React, { Suspense } from "react";
import DrawingArea from "./components/DrawingArea";

export default function App() {
    return (
        <Suspense fallback="Loading">
            <DrawingArea />
        </Suspense>
    );
}
