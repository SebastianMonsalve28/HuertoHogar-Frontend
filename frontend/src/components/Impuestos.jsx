import React from "react";
import {desgloseImpuestos, money} from "../carrito";
export default function Impuestos({total, neto, iva, compacto = false, unidad}) {
 const calculo=desgloseImpuestos(total);
 if (compacto) return <p className="small text-secondary mt-2 mb-0" aria-label="Desglose de impuestos">
  Neto sin IVA: {money(neto ?? calculo.neto)} · IVA incluido (19 %): {money(iva ?? calculo.iva)}{unidad && ` por ${unidad}`}.
 </p>;
 return <div className="tax-summary" aria-label="Desglose de impuestos">
  <div className="summary-row"><span>Neto sin IVA</span><span>{money(neto ?? calculo.neto)}</span></div>
  <div className="summary-row"><span>IVA incluido (19 %)</span><span>{money(iva ?? calculo.iva)}</span></div>
 </div>;
}
