import React,{createContext,useContext,useEffect,useState} from "react";
import {storage} from "./almacenamiento";
import {addItem,changeQuantity,offerPrice,reconcileCart,available,validQuantity,stepOf} from "./carrito";
import {api,apiPublica,sesionPorCookie,guardarToken,cerrarSesion} from "./api";
import { cajaValida, reservadoEnCajas } from "./cajas";
const Store=createContext(null);
export const useStore=()=>useContext(Store);
export function StoreProvider({children}){
 const [products,setProducts]=useState([]);
 const [productsLoading,setProductsLoading]=useState(true);
 const [productsLoaded,setProductsLoaded]=useState(false);
 const [items,setItems]=useState(()=>{
  const saved=storage.read('cart',[]);
  return Array.isArray(saved)?saved.filter(i=>i.codigo && Number.isFinite(Number(i.cantidad)) && Number(i.cantidad)>0):[];
 });
 const [cajas,setCajas]=useState(()=>{
  const saved=storage.read('cajas',[]);
  return Array.isArray(saved)?saved:[];
 });
 const [user,setUser]=useState(null),[userLoading,setUserLoading]=useState(true);
 const [notice,setNotice]=useState("");
 async function refreshProducts(){
  const catalog=await apiPublica('/productos');
  if(!Array.isArray(catalog))throw new Error('El servidor devolvió un catálogo inválido.');
  setProducts(catalog);setProductsLoaded(true);
  return catalog;
 }
 useEffect(()=>{
  let active=true;
  apiPublica('/productos').then(catalog=>{
   if(active){setProducts(Array.isArray(catalog)?catalog:[]);setProductsLoaded(Array.isArray(catalog));}
  }).catch(e=>{if(active)setNotice(e.message);}).finally(()=>{if(active)setProductsLoading(false);});
  sesionPorCookie().then(data=>{if(active)setUser(data.user);}).catch(()=>{if(active)setUser(null);})
  .finally(()=>{if(active)setUserLoading(false);});
  return ()=>{active=false;};
 },[]);
 // La disponibilidad visual descuenta lo reservado en el carrito.
 // El stock de la base de datos se descuenta SOLO al confirmar un pedido.
 useEffect(()=>{
  if(productsLoading || !productsLoaded)return;
  setItems(prev=>{
   const updated=reconcileCart(prev,products);
   return JSON.stringify(updated)===JSON.stringify(prev)?prev:updated;
  });
 },[products,productsLoading,productsLoaded]);
 useEffect(()=>{storage.write('cart',items);},[items]);
 useEffect(()=>{storage.write('cajas',cajas);},[cajas]);
 useEffect(()=>{
  if(productsLoading || !productsLoaded)return;
  let prevCajas=[];
  const validas=[];
  for(const caja of cajas){
   if(cajaValida(caja,products,items,prevCajas)){
    validas.push(caja);prevCajas.push(caja);
   }
  }
  if(validas.length!==cajas.length)setCajas(validas);
 },[products,productsLoading,productsLoaded,items]);
 function disponible(codigo){const p=products.find(p=>p.codigo===codigo);
  return p?Math.max(0,Math.round((available(p,items)-reservadoEnCajas(cajas,codigo))*100)/100):0;
 }
 async function login(correo,password){
  const data=await apiPublica('/auth/login',{method:'POST',body:{correo,password}});
  guardarToken(data.accessToken);setUser(data.user);return data.user;
 }
 async function registrar(datos){
  const data=await apiPublica('/auth/registro',{method:'POST',body:datos});
  guardarToken(data.accessToken);setUser(data.user);return data.user;
 }
 async function logout(){try{await cerrarSesion();}finally{setUser(null);setItems([]);setCajas([]);}}
 function add(product,quantity){
  try{
   const latest=products.find(p=>p.codigo===product.codigo);
   if(!latest)throw new Error('Este producto ya no está disponible.');
   const stockLibre={...latest,stock:Number(latest.stock)-reservadoEnCajas(cajas,latest.codigo)};
   setItems(addItem(items,stockLibre,quantity ?? stepOf(latest)));
   setNotice(`${latest.nombre} agregado al carrito. Se actualizó la disponibilidad.`);
  }catch(e){setNotice(e.message);}
 }
 function update(codigo,cantidad){
  try{
   const p=products.find(x=>x.codigo===codigo);
   if(!p)throw new Error('Este producto ya no está disponible.');
   setItems(changeQuantity(items.map(i=>i.codigo===codigo?{...i,stock:Number(p.stock)-reservadoEnCajas(cajas,codigo)}:i),codigo,cantidad));
  }catch(e){setNotice(e.message);}
 }
 function addCaja(caja){
  if(!cajaValida(caja,products,items,cajas))throw new Error('No hay stock suficiente para completar esta caja.');
  setCajas(prev=>[...prev,{...caja,id:`caja-${Date.now()}-${Math.random().toString(36).slice(2)}`}]);
  setNotice(`${caja.nombre} agregada al carrito.`);
 }
 function quitarCaja(id){setCajas(prev=>prev.filter(c=>c.id!==id));}
 return <Store.Provider value={{products,setProducts,productsLoading,refreshProducts,items,setItems,cajas,setCajas,addCaja,quitarCaja,
  disponible,user,setUser,userLoading,login,registrar,logout,notice,setNotice,add,update,api}}>{children}</Store.Provider>;
}
