import React from 'react';
import {render,screen,fireEvent,cleanup} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import GuiaTemporada from '../src/pages/GuiaTemporada';
import {totalCaja,cajaValida,reservadoEnCajas} from '../src/cajas';

const catalogo=[{codigo:'FR001',nombre:'Manzanas',precio:1200,descuento:15,stock:10,unidadVenta:'kg'},
 {codigo:'VR001',nombre:'Zanahorias',precio:900,descuento:10,stock:8,unidadVenta:'kg'}];
const caja={tipo:'personalizada',productos:[{codigo:'FR001',cantidad:0.5},{codigo:'VR001',cantidad:1}]};

describe('EP3 · cajas preparadas y personalizadas',()=>{
 it('calcula monto con descuentos de la caja',()=>expect(totalCaja(caja,catalogo)).toBe(1320));
 it('no acepta caja si productos individuales reservan todo el stock',()=>{
  expect(cajaValida(caja,catalogo,[{codigo:'FR001',cantidad:10}],[])).toBeFalse();
 });
 it('acumula reservas de cajas en stock visible',()=>{
  expect(reservadoEnCajas([caja,caja],'FR001')).toBe(1);
 });
});
describe('EP3 · contenido y accesibilidad de temporada',()=>{
 afterEach(()=>cleanup());
 it('muestra temporadas de Chile y consejos de conservación',()=>{
  render(<MemoryRouter><GuiaTemporada/></MemoryRouter>);
  expect(screen.getAllByText('Primavera')[0]).toBeTruthy();
  expect(screen.getAllByText('Invierno')[0]).toBeTruthy();
  expect(screen.getByText('Hojas verdes')).toBeTruthy();
 });
 it('filtra invierno y deja oculta primavera',()=>{
  render(<MemoryRouter><GuiaTemporada/></MemoryRouter>);
  fireEvent.click(screen.getByRole('button',{name:'Invierno'}));
  expect(screen.getAllByText('Invierno').length).toBeGreaterThan(0);
  expect(screen.queryByText('Tiempo de hojas tiernas, hortalizas frescas y primeras frutas.')).toBeNull();
 });
});
