/**
 * Portal REGULATEL – Enrutado principal y layout.
 * Versión inicial desarrollada por Diego Cuervo (INDOTEL). 2026.
 */
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { AdminDataProvider } from '@/contexts/AdminDataContext';
import { SiteSettingsProvider } from '@/contexts/SiteSettingsContext';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import AdminLayout from '@/pages/admin/AdminLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminNoticias from '@/pages/admin/AdminNoticias';
import AdminEventos from '@/pages/admin/AdminEventos';
import AdminCifras from '@/pages/admin/AdminCifras';
import AdminDirectorio from '@/pages/admin/AdminDirectorio';
import AdminDocumentos from '@/pages/admin/AdminDocumentos';
import AdminRevista from '@/pages/admin/AdminRevista';
import AdminUsuarios from '@/pages/admin/AdminUsuarios';
import AdminAccesoActas from '@/pages/admin/AdminAccesoActas';
import AdminContentHome from '@/pages/admin/content/AdminContentHome';
import AdminContentCumbres from '@/pages/admin/content/AdminContentCumbres';
import AdminContentGaleria from '@/pages/admin/content/AdminContentGaleria';
import AdminContentAccesos from '@/pages/admin/content/AdminContentAccesos';
import AdminContentNavigation from '@/pages/admin/content/AdminContentNavigation';
import AdminMedia from '@/pages/admin/AdminMedia';
import Home from '@/pages/Home';
import Autoridades from '@/pages/Autoridades';
import AutoridadDetalle from '@/pages/AutoridadDetalle';
import Miembros from '@/pages/Miembros';
import ComiteEjecutivo from '@/pages/ComiteEjecutivo';
import Gestion from '@/pages/Gestion';
import GruposTrabajo from '@/pages/GruposTrabajo';
import Noticias from '@/pages/Noticias';
import NoticiaIndividual from '@/pages/NoticiaIndividual';
import Eventos from '@/pages/Eventos';
import EventoDetalle from '@/pages/EventoDetalle';
import Convenios from '@/pages/Convenios';
import ConvenioDetalle from '@/pages/ConvenioDetalle';
import Contacto from '@/pages/Contacto';
import EnteRegulador from '@/pages/EnteRegulador';
import TodoPlaceholder from '@/pages/TodoPlaceholder';
import Search from '@/pages/Search';
import BuscarDocumentos from '@/pages/BuscarDocumentos';
import AccesoDocumentos from '@/pages/AccesoDocumentos';
import MicrositioBuenasPracticas from '@/pages/MicrositioBuenasPracticas';
import EstudiosInvestigacion from '@/pages/EstudiosInvestigacion';
import Galeria from '@/pages/Galeria';
import GaleriaAlbum from '@/pages/GaleriaAlbum';
import Subscribe from '@/pages/Subscribe';
import CanalYouTube from '@/pages/CanalYouTube';
import DeclaracionPrivacidad from '@/pages/DeclaracionPrivacidad';
import QueSomos from '@/pages/quienes-somos/QueSomos';
import VisionMision from '@/pages/quienes-somos/VisionMision';
import ObjetivosYFunciones from '@/pages/quienes-somos/ObjetivosYFunciones';
import ProtocolosYProcedimientos from '@/pages/quienes-somos/ProtocolosYProcedimientos';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <Router>
      <AuthProvider>
        <AdminDataProvider>
          <SiteSettingsProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="content/home" element={<AdminContentHome />} />
              <Route path="content/cumbres" element={<AdminContentCumbres />} />
              <Route path="content/galeria" element={<AdminContentGaleria />} />
              <Route path="content/accesos" element={<AdminContentAccesos />} />
              <Route path="content/navigation" element={<AdminContentNavigation />} />
              <Route path="media" element={<AdminMedia />} />
              <Route path="noticias" element={<AdminNoticias />} />
              <Route path="eventos" element={<AdminEventos />} />
              <Route path="cifras" element={<AdminCifras />} />
              <Route path="directorio-autoridades" element={<AdminDirectorio />} />
              <Route path="documentos" element={<AdminDocumentos />} />
              <Route path="revista" element={<AdminRevista />} />
              <Route path="usuarios" element={<AdminUsuarios />} />
              <Route path="acceso-actas" element={<AdminAccesoActas />} />
            </Route>
            <Route element={<Layout><Outlet /></Layout>}>
              <Route path="/" element={<Home />} />
              <Route path="/que-somos" element={<QueSomos />} />
              <Route path="/vision-mision" element={<VisionMision />} />
              <Route path="/funciones" element={<ObjetivosYFunciones />} />
              <Route path="/objetivos-y-funciones" element={<ObjetivosYFunciones />} />
              <Route path="/reglamento" element={<ProtocolosYProcedimientos />} />
              <Route path="/protocolos-y-procedimientos" element={<ProtocolosYProcedimientos />} />
              <Route path="/search" element={<Search />} />
              <Route path="/buscar-documentos" element={<BuscarDocumentos />} />
          <Route path="/acceso-documentos" element={<AccesoDocumentos />} />
          <Route path="/micrositio-buenas-practicas" element={<MicrositioBuenasPracticas />} />
          <Route path="/estudios-e-investigacion" element={<EstudiosInvestigacion />} />
          <Route path="/galeria" element={<Galeria />} />
          <Route path="/galeria/:slug" element={<GaleriaAlbum />} />
          <Route path="/autoridades" element={<Autoridades />} />
              <Route path="/autoridades/:slug" element={<AutoridadDetalle />} />
          <Route path="/miembros" element={<Miembros />} />
          <Route path="/comite-ejecutivo" element={<ComiteEjecutivo />} />
          <Route path="/gestion" element={<Gestion />} />
          <Route path="/recursos" element={<Gestion />} />
          <Route path="/grupos-de-trabajo" element={<GruposTrabajo />} />
          <Route path="/noticias" element={<Noticias />} />
          <Route path="/noticias/:slug" element={<NoticiaIndividual />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/eventos/:id" element={<EventoDetalle />} />
          <Route path="/convenios" element={<Convenios />} />
              <Route path="/convenios/:slug" element={<ConvenioDetalle />} />
          <Route path="/contacto" element={<Contacto />} />
              <Route path="/subscribe" element={<Subscribe />} />
              <Route path="/canal-youtube" element={<CanalYouTube />} />
              <Route path="/declaracion-de-privacidad" element={<DeclaracionPrivacidad />} />
              <Route path="/pendiente/:slug" element={<TodoPlaceholder />} />
              {/* Rutas individuales de entes reguladores */}
          <Route path="/sub-secretaria-telecom" element={<EnteRegulador />} />
          <Route path="/anatel" element={<EnteRegulador />} />
          <Route path="/att" element={<EnteRegulador />} />
          <Route path="/enacom" element={<EnteRegulador />} />
          <Route path="/sutel" element={<EnteRegulador />} />
          <Route path="/min-com" element={<EnteRegulador />} />
          <Route path="/agcom" element={<EnteRegulador />} />
          <Route path="/arcotel" element={<EnteRegulador />} />
          <Route path="/crc" element={<EnteRegulador />} />
          <Route path="/cnmc" element={<EnteRegulador />} />
          <Route path="/sit" element={<EnteRegulador />} />
          <Route path="/conatel" element={<EnteRegulador />} />
          <Route path="/indotel" element={<EnteRegulador />} />
          <Route path="/ift" element={<EnteRegulador />} />
          <Route path="/subtel" element={<EnteRegulador />} />
          <Route path="/osiptel" element={<EnteRegulador />} />
          <Route path="/conatel-gt" element={<EnteRegulador />} />
          <Route path="/conatel-py" element={<EnteRegulador />} />
          <Route path="/anacom" element={<EnteRegulador />} />
          <Route path="/net" element={<EnteRegulador />} />
          <Route path="/ursec" element={<EnteRegulador />} />
          <Route path="/conatel-ve" element={<EnteRegulador />} />
          <Route path="/asep" element={<EnteRegulador />} />
          <Route path="/telcor" element={<EnteRegulador />} />
          <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
          </SiteSettingsProvider>
        </AdminDataProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
