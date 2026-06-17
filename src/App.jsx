import { useState } from 'react'
import emailjs from '@emailjs/browser'

function App() {
  const [mostrarBienvenida, setMostrarBienvenida] = useState(true)
  const [modoOscuro, setModoOscuro] = useState(true)

  // Estados para el formulario de contacto
  const [correo, setCorreo] = useState('')
  const [mensaje, setMensaje] = useState('')

  // Estados para el cuestionario interactivo
  const [preguntaActual, setPreguntaActual] = useState(0)
  const [puntaje, setPuntaje] = useState(0)
  const [mostrarResultado, setMostrarResultado] = useState(false)
  const [opcionSeleccionada, setOpcionSeleccionada] = useState(null)
  const [respondido, setRespondido] = useState(false)

  // 🆔 ESTADOS PARA LA BÚSQUEDA DE DNI
  const [dniBusqueda, setDniBusqueda] = useState('')
  const [resultadoDni, setResultadoDni] = useState(null)
  const [cargandoDni, setCargandoDni] = useState(false)

  const preguntasQuiz = [
    {
      pregunta: "¿Qué significa la estructura de carpetas 'src' en un proyecto de React?",
      opciones: [
        "Es donde se guardan los archivos públicos como el index.html.",
        "Significa 'Source' (Código Fuente) y contiene los componentes principales como App.jsx.",
        "Es la carpeta destinada únicamente para guardar imágenes pesadas.",
        "Contiene las dependencias descargadas por npm."
      ],
      correcta: 1
    },
    {
      pregunta: "¿Qué comando se utiliza para ejecutar el servidor de desarrollo en Vite?",
      opciones: [
        "npm install",
        "npm run build",
        "npm run dev",
        "node server.js"
      ],
      correcta: 2
    },
    {
      pregunta: "¿Para qué sirve el Hook 'useState' en React?",
      opciones: [
        "Para conectar la aplicación con una base de datos externa.",
        "Para cambiar el estilo CSS de un archivo de manera permanente.",
        "Para crear y gestionar un estado dinámico dentro de un componente.",
        "Para instalar librerías desde la terminal de comandos."
      ],
      correcta: 3
    }
  ]

  const tema = {
    bg: modoOscuro ? '#0f172a' : '#f8fafc',
    card: modoOscuro ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.8)',
    texto: modoOscuro ? '#f1f5f9' : '#1e293b',
    primario: '#38bdf8', 
    secundario: '#818cf8', 
    borde: modoOscuro ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
  }

  const manejarSeleccionOpcion = (indiceOpcion) => {
    if (respondido) return
    setOpcionSeleccionada(indiceOpcion)
    setRespondido(true)
    if (indiceOpcion === preguntasQuiz[preguntaActual].correcta) {
      setPuntaje(puntaje + 1)
    }
  }

  const siguientePregunta = () => {
    setOpcionSeleccionada(null)
    setRespondido(false)
    const proxima = preguntaActual + 1
    if (proxima < preguntasQuiz.length) {
      setPreguntaActual(proxima)
    } else {
      setMostrarResultado(true)
    }
  }

  const reiniciarQuiz = () => {
    setPreguntaActual(0)
    setPuntaje(0)
    setMostrarResultado(false)
    setOpcionSeleccionada(null)
    setRespondido(false)
  }

  const manejarEnvioCorreo = (e) => {
    e.preventDefault()
    
    if (!correo || !mensaje) {
      alert('Por favor, completa ambos campos.')
      return
    }

    const parametrosTemplate = {
      reply_to: correo,
      email: correo,
      name: "Usuario del Portafolio",
      nombre: "Usuario del Portafolio",
      message: mensaje,    
      preguntas: mensaje,  
      to_email: 'rs9183786@gmail.com'
    }

    const SERVICE_ID = 'service_8l2kxob'       
    const PUBLIC_KEY = 'qf8TfbEVIOzMfaTED'     
    
    const TEMPLATE_TU_CORREO = 'template_nqx0dzf'   
    const TEMPLATE_AUTO_RESPUESTA = 'template_2a2xhfu' 

    emailjs.send(SERVICE_ID, TEMPLATE_TU_CORREO, parametrosTemplate, PUBLIC_KEY)
      .then(() => {
          return emailjs.send(SERVICE_ID, TEMPLATE_AUTO_RESPUESTA, parametrosTemplate, PUBLIC_KEY)
      })
      .then(() => {
          alert('¡Mensaje enviado con éxito! Rodrigo, revisa tu Gmail.')
          setCorreo('')
          setMensaje('')
      })
      .catch((error) => {
          console.error('Error de EmailJS:', error)
          alert(`Hubo un error al enviar el mensaje. Detalle: ${error.text || error}`)
      })
  }

  // 🔍 CONSULTA REAL EN VIVO BASADA ESTRICTAMENTE EN TU ARCHIVO SWAGGER
  const consultarDNI = async (e) => {
    e.preventDefault()

    if (dniBusqueda.length !== 8) {
      alert('Por favor, ingresa un DNI válido de 8 dígitos.')
      return
    }

    setCargandoDni(true)
    setResultadoDni(null)

    // 🔴 REEMPLAZA ESTO CON TU TOKEN PROPIO DE APIs PERÚ (Asegúrate de que esté completo)
    const MI_TOKEN_DE_APISPERU = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InJzOTE4Mzc4NkBnbWFpbC5jb20ifQ.cLsfwwFVDfmgjCeChM6l1kNeErkLmnyb19opHNl8RNI"

    try {
      // 1. URL base según la propiedad 'servers' de tu swagger.json
      const baseUrl = "https://dniruc.apisperu.com/api/v1"
      
      // 2. Ruta exacta combinando el número en el path y el token en la query (?token=) como exige el archivo
      const targetUrl = `${baseUrl}/dni/${dniBusqueda}?token=${MI_TOKEN_DE_APISPERU}`

      // 3. Usamos corsproxy.io para que tu navegador no bloquee la petición desde localhost
      const proxyUrl = "https://corsproxy.io/?" + encodeURIComponent(targetUrl)

      const respuesta = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })

      if (!respuesta.ok) {
        throw new Error(`Código de error del servidor: ${respuesta.status}`)
      }

      const datos = await respuesta.json()

      // 4. Mapeamos los campos tal cual vienen en el esquema de éxito de tu swagger (nombres, apellidoPaterno, etc.)
      if (datos && datos.nombres) {
        setResultadoDni({
          dni: datos.dni,
          nombres: datos.nombres,
          apellidoPaterno: datos.apellidoPaterno,
          apellidoMaterno: datos.apellidoMaterno,
          codVerifica: datos.codVerifica || "0"
        })
      } else {
        // Captura el mensaje interno por si el token llegó al límite de consumo o es incorrecto
        alert(datos.message || 'No se encontraron registros o tu cuenta se quedó sin créditos de consulta.')
      }

    } catch (error) {
      console.error("Error en la petición real:", error)
      alert("Hubo un error al conectar con APIs Perú. Asegúrate de haber copiado todo tu token correctamente o verifica tu saldo de red.")
    } finally {
      setCargandoDni(false)
    }
  }

  const enviarWhatsApp = () => {
    const tuNumero = "51999999999" 
    const textoMensaje = encodeURIComponent("¡Hola Rodrigo! Vi tu portafolio y me gustaría ponerme en contacto contigo.")
    window.open(`https://wa.me/${tuNumero}?text=${textoMensaje}`, '_blank')
  }

  return (
    <div style={{ 
      fontFamily: "'Poppins', sans-serif", 
      backgroundColor: tema.bg, 
      color: tema.texto, 
      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      scrollBehavior: 'smooth'
    }}>
      
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');
          html { scroll-behavior: smooth; }
          a:hover { opacity: 0.7; }
        `}
      </style>

      {/* BIENVENIDA */}
      {mostrarBienvenida && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: modoOscuro ? 'radial-gradient(circle, #1e293b 0%, #0f172a 100%)' : 'radial-gradient(circle, #f8fafc 0%, #e2e8f0 100%)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
          zIndex: 10000, textAlign: 'center', padding: '20px'
        }}>
          <img src="https://media1.tenor.com/m/SNlBq5IZu0IAAAAC/son-goku.gif" alt="Goku" 
            style={{ width: '220px', borderRadius: '50%', border: `4px solid ${tema.primario}`, marginBottom: '20px', boxShadow: `0 0 40px ${tema.primario}44` }} />
          <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '10px' }}>Rodrigo Salvador</h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.8, marginBottom: '30px', maxWidth: '600px' }}>
            Desarrollador en formación & tecnología. Bienvenido a mi espacio digital.
          </p>
          <button onClick={() => setMostrarBienvenida(false)} 
            style={{ padding: '15px 45px', fontSize: '1.1rem', fontWeight: '600', borderRadius: '50px', border: 'none', background: `linear-gradient(90deg, ${tema.primario}, ${tema.secundario})`, color: 'white', cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}>
            INGRESAR AL PORTAFOLIO
          </button>
        </div>
      )}

      {/* NAVBAR */}
      <nav style={{
        position: 'fixed', top: 0, width: '100%', height: '70px',
        background: modoOscuro ? 'rgba(15, 23, 42, 0.8)' : 'rgba(248, 250, 252, 0.8)',
        backdropFilter: 'blur(10px)', borderBottom: `1px solid ${tema.borde}`,
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '30px', zIndex: 1000
      }}>
        {['Inicio', 'Sobre Mi', 'Proyectos', 'Herramientas'].map((item) => (
          <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} 
             style={{ textDecoration: 'none', color: tema.texto, fontWeight: '600', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {item}
          </a>
        ))}
        <button onClick={() => setModoOscuro(!modoOscuro)} 
          style={{ background: tema.texto, color: tema.bg, border: 'none', padding: '5px 12px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>
          {modoOscuro ? '☀️' : '🌙'}
        </button>
      </nav>

      {/* CONTENEDOR DE SECCIONES */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '100px 20px' }}>
        
        {/* INICIO */}
        <section id="inicio" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <h2 style={{ fontSize: '4rem', fontWeight: '800', background: `linear-gradient(to right, ${tema.primario}, ${tema.secundario})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Hola, soy Rodrigo
          </h2>
          <p style={{ fontSize: '1.5rem', opacity: 0.7, marginTop: '10px' }}>Estudiante de Programación & Creador Digital</p>
          <div style={{ marginTop: '30px' }}>
            <a href="/pdf/CV_Personal.pdf" download style={{ padding: '12px 30px', background: tema.primario, color: 'white', textDecoration: 'none', borderRadius: '10px', fontWeight: '600', boxShadow: `0 4px 14px ${tema.primario}66` }}>
              Descargar CV
            </a>
          </div>
        </section>

        {/* SOBRE MI */}
        <section id="sobre-mi" style={{ minHeight: '70vh', padding: '80px 0' }}>
          <h3 style={{ fontSize: '2rem', marginBottom: '40px', borderLeft: `5px solid ${tema.primario}`, paddingLeft: '15px' }}>Sobre Mí</h3>
          <div style={{ background: tema.card, padding: '40px', borderRadius: '24px', border: `1px solid ${tema.borde}`, lineHeight: '1.8' }}>
            <p>Soy un apasionado por la tecnología que busca aprender y crecer en el mundo del desarrollo web. Me gusta enfrentar retos lógicos y crear interfaces que sean tanto funcionales como hermosas.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '30px' }}>
              <div style={{ padding: '20px', borderRadius: '15px', background: modoOscuro ? '#1e293b' : '#fff', textAlign: 'center' }}>
                <span style={{ fontSize: '2rem' }}>💻</span>
                <h4 style={{ margin: '10px 0 5px' }}>Desarrollo</h4>
                <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>HTML, CSS, React</p>
              </div>
              <div style={{ padding: '20px', borderRadius: '15px', background: modoOscuro ? '#1e293b' : '#fff', textAlign: 'center' }}>
                <span style={{ fontSize: '2rem' }}>🎨</span>
                <h4 style={{ margin: '10px 0 5px' }}>Diseño</h4>
                <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>UI/UX, Estética</p>
              </div>
            </div>
          </div>
        </section>

        {/* PROYECTOS */}
        <section id="proyectos" style={{ minHeight: '70vh', padding: '80px 0' }}>
          <h3 style={{ fontSize: '2rem', marginBottom: '40px', borderLeft: `5px solid ${tema.primario}`, paddingLeft: '15px' }}>Mis Proyectos</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ background: tema.card, borderRadius: '20px', overflow: 'hidden', border: `1px solid ${tema.borde}` }}>
                <div style={{ height: '180px', background: `linear-gradient(45deg, #1e293b, ${tema.primario}44)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <span style={{ fontSize: '3rem', opacity: 0.3 }}>PROJECT {i}</span>
                </div>
                <div style={{ padding: '20px' }}>
                  <h4 style={{ marginBottom: '10px' }}>Título del Proyecto {i}</h4>
                  <p style={{ fontSize: '0.9rem', opacity: 0.6, marginBottom: '15px' }}>Descripción breve del proyecto realizado con tecnologías modernas.</p>
                  <a href="#" style={{ color: tema.primario, fontWeight: 'bold', textDecoration: 'none' }}>Ver más →</a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECCIÓN HERRAMIENTAS INTERACTIVAS */}
        <section id="herramientas" style={{ minHeight: '70vh', padding: '80px 0' }}>
          <h3 style={{ fontSize: '2rem', marginBottom: '40px', borderLeft: `5px solid ${tema.primario}`, paddingLeft: '15px' }}>Módulos e Integraciones API</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', marginBottom: '40px' }}>
            
            {/* 1. TRIVIA DE PROGRAMACIÓN */}
            <div style={{ background: tema.card, padding: '30px', borderRadius: '24px', border: `1px solid ${tema.borde}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ marginTop: 0, marginBottom: '10px', color: tema.primario }}>🧠 Trivia Interactiva</h4>
                
                {!mostrarResultado ? (
                  <div>
                    <p style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '15px' }}>
                      Pregunta {preguntaActual + 1} de {preguntasQuiz.length}
                    </p>
                    <p style={{ fontWeight: '600', marginBottom: '20px', lineHeight: '1.4' }}>
                      {preguntasQuiz[preguntaActual].pregunta}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {preguntasQuiz[preguntaActual].opciones.map((opcion, indice) => {
                        let colorFondo = modoOscuro ? '#1e293b' : '#fff'
                        let colorBorde = tema.borde

                        if (respondido) {
                          if (indice === preguntasQuiz[preguntaActual].correcta) {
                            colorFondo = 'rgba(34, 197, 94, 0.2)'
                            colorBorde = '#22c55e'
                          } else if (indice === opcionSeleccionada) {
                            colorFondo = 'rgba(239, 68, 68, 0.2)'
                            colorBorde = '#ef4444'
                          }
                        }

                        return (
                          <button
                            key={indice}
                            onClick={() => manejarSeleccionOpcion(indice)}
                            disabled={respondido}
                            style={{
                              padding: '12px 15px', textAlign: 'left', borderRadius: '12px', border: `2px solid ${colorBorde}`,
                              backgroundColor: colorFondo, color: tema.texto, cursor: respondido ? 'default' : 'pointer',
                              transition: '0.2s', fontSize: '0.9rem', lineHeight: '1.3'
                            }}
                          >
                            {opcion}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <span style={{ fontSize: '4rem' }}>🏆</span>
                    <h5 style={{ fontSize: '1.5rem', margin: '15px 0 10px' }}>¡Cuestionario Terminado!</h5>
                    <p style={{ fontSize: '1.1rem', opacity: 0.8 }}>
                      Tu puntuación fue de <strong>{puntaje}</strong> de <strong>{preguntasQuiz.length}</strong>.
                    </p>
                  </div>
                )}
              </div>

              <div style={{ marginTop: '25px' }}>
                {respondido && !mostrarResultado && (
                  <button onClick={siguientePregunta} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: tema.primario, color: '#0f172a', fontWeight: 'bold', cursor: 'pointer' }}>
                    {preguntaActual + 1 === preguntasQuiz.length ? "Ver Resultados 🏁" : "Siguiente Pregunta ➡️"}
                  </button>
                )}
                {mostrarResultado && (
                  <button onClick={reiniciarQuiz} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: `2px solid ${tema.primario}`, backgroundColor: 'transparent', color: tema.primario, fontWeight: 'bold', cursor: 'pointer' }}>
                    🔄 Intentar de Nuevo
                  </button>
                )}
              </div>
            </div>

            {/* 2. INTEGRACIÓN EN VIVO DE CONSULTA DE DNI REAL */}
            <div style={{ background: tema.card, padding: '30px', borderRadius: '24px', border: `1px solid ${tema.borde}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ marginTop: 0, marginBottom: '10px', color: tema.secundario }}>🆔 Consulta de DNI (Módulo Real)</h4>
                <p style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '20px' }}>
                  Búsqueda directa conectada en tiempo real mediante los servidores oficiales de APIs Perú.
                </p>

                <form onSubmit={consultarDNI} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  <input 
                    type="text" 
                    maxLength="8"
                    placeholder="Ingresa DNI real" 
                    value={dniBusqueda}
                    onChange={(e) => setDniBusqueda(e.target.value.replace(/\D/g, ''))} 
                    style={{ flex: 1, padding: '12px', borderRadius: '10px', border: `1px solid ${tema.borde}`, backgroundColor: modoOscuro ? '#1e293b' : '#fff', color: tema.texto, outline: 'none', fontWeight: 'bold', fontSize: '1rem', letterSpacing: '2px' }}
                  />
                  <button 
                    type="submit" 
                    disabled={cargandoDni}
                    style={{ padding: '0 20px', borderRadius: '10px', border: 'none', backgroundColor: tema.secundario, color: 'white', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}
                  >
                    {cargandoDni ? '...' : '🔍'}
                  </button>
                </form>

                {/* Caja de Resultados */}
                {cargandoDni && (
                  <div style={{ textAlign: 'center', padding: '20px', opacity: 0.7 }}>
                    <p>⏳ Buscando en los registros nacionales...</p>
                  </div>
                )}

                {resultadoDni && (
                  <div style={{ background: modoOscuro ? 'rgba(15,23,42,0.5)' : '#fff', padding: '20px', borderRadius: '15px', border: `1px solid #38bdf8`, fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div><span style={{ opacity: 0.5 }}>Nombres:</span> <strong style={{ color: tema.primario }}>{resultadoDni.nombres}</strong></div>
                    <div><span style={{ opacity: 0.5 }}>Apellido Paterno:</span> <strong>{resultadoDni.apellidoPaterno}</strong></div>
                    <div><span style={{ opacity: 0.5 }}>Apellido Materno:</span> <strong>{resultadoDni.apellidoMaterno}</strong></div>
                    <div><span style={{ opacity: 0.5 }}>Documento:</span> <strong>{resultadoDni.dni}</strong></div>
                    <div><span style={{ opacity: 0.5 }}>Dígito Verificador:</span> <strong>{resultadoDni.codVerifica}</strong></div>
                  </div>
                )}
              </div>
              
              <div style={{ fontSize: '0.75rem', opacity: 0.6, textAlign: 'center', marginTop: '15px', color: '#38bdf8' }}>
                🌐 Consulta de producción activa
              </div>
            </div>

          </div>

          {/* 3. FORMULARIO DE CORREO ABAJO */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
            <div style={{ background: tema.card, padding: '30px', borderRadius: '24px', border: `1px solid ${tema.borde}`, gridColumn: '1 / -1' }}>
              <h4 style={{ marginTop: 0, marginBottom: '15px', color: tema.primario }}>Escríbeme Directo</h4>
              
              <form onSubmit={manejarEnvioCorreo} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input 
                  type="email" 
                  placeholder="Tu correo electrónico" 
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  style={{ padding: '12px', borderRadius: '10px', border: `1px solid ${tema.borde}`, backgroundColor: modoOscuro ? '#1e293b' : '#fff', color: tema.texto, outline: 'none' }}
                />
                <textarea 
                  rows="4" 
                  placeholder="Escribe tu mensaje aquí..." 
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  style={{ padding: '12px', borderRadius: '10px', border: `1px solid ${tema.borde}`, backgroundColor: modoOscuro ? '#1e293b' : '#fff', color: tema.texto, outline: 'none', resize: 'none' }}
                />
                <button 
                  type="submit" 
                  style={{ padding: '12px', borderRadius: '10px', border: 'none', background: `linear-gradient(90deg, ${tema.primario}, ${tema.secundario})`, color: 'white', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                >
                  📨 Enviar Mensaje
                </button>
              </form>

              <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', opacity: 0.4 }}>
                <hr style={{ flex: 1, borderBottom: `1px solid ${tema.texto}` }} />
                <span style={{ padding: '0 10px', fontSize: '0.8rem' }}>O TAMBIÉN</span>
                <hr style={{ flex: 1, borderBottom: `1px solid ${tema.texto}` }} />
              </div>

              <button 
                onClick={enviarWhatsApp}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: '#25D366', color: 'white', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)' }}
              >
                💬 Chatear por WhatsApp
              </button>
            </div>
          </div>
        </section>

      </div>

      <footer style={{ padding: '50px 20px', textAlign: 'center', borderTop: `1px solid ${tema.borde}` }}>
        <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>© 2026 Rodrigo Salvador. Hecho con React & Vite.</p>
      </footer>

    </div>
  )
}

export default App