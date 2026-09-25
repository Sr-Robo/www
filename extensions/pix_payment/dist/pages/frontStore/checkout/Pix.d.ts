import React from 'react';
export default function PixMethod({ createChargeApi, confirmApi }: {
    createChargeApi: string;
    confirmApi: string;
}): React.JSX.Element | null;
export declare const layout: {
    areaId: string;
    sortOrder: number;
};
export declare const query = "query Query { createChargeApi: url(routeId: \"pixCreateCharge\") confirmApi: url(routeId: \"pixSimulate\") }";
