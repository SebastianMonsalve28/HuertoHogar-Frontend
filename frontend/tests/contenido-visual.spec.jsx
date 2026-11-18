import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { About, Blog } from '../src/pages/Contenido';

describe('EP3 · contenido de Huerto Hogar', () => {
  afterEach(() => cleanup());

  it('presenta la historia de la tienda y un enlace al catálogo', () => {
    render(<MemoryRouter><About /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: /Una tienda que nace/i })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Explorar productos' }).getAttribute('href')).toContain('/productos');
  });

  it('presenta los dos artículos del blog', () => {
    render(<MemoryRouter initialEntries={['/blog']}><Routes><Route path='/blog' element={<Blog />} /></Routes></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Historias del huerto' })).toBeTruthy();
    expect(screen.getAllByRole('link', { name: 'Descubrir la historia →' }).length).toBe(2);
  });

  it('muestra el artículo correcto al ingresar a la URL del segundo blog', () => {
    render(<MemoryRouter initialEntries={['/blog/2']}><Routes><Route path='/blog/:id' element={<Blog />} /></Routes></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Del huerto a tu mesa' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Pequeñas ideas' })).toBeTruthy();
  });
});
