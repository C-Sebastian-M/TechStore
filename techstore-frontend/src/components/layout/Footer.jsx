import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-surface-dark border-t border-slate-200 dark:border-border-dark pt-12 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4 text-slate-900 dark:text-white">
              <div className="flex size-6 items-center justify-center rounded bg-primary text-white">
                <span className="material-symbols-outlined text-[16px]">memory</span>
              </div>
              <span className="text-lg font-bold">TechStore</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Expertos en hardware y computación de alto rendimiento. Construimos sueños, un componente a la vez.
            </p>
            <div className="flex gap-4">
              <a className="text-slate-400 hover:text-primary transition-colors" href="https://www.techstore.com">
                <span className="material-symbols-outlined">public</span>
              </a>
              <a className="text-slate-400 hover:text-primary transition-colors" href="mailto:contact@techstore.com">
                <span className="material-symbols-outlined">alternate_email</span>
              </a>
            </div>
          </div>

          {/* Comprar */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">Comprar</h3>
            <ul className="flex flex-col gap-2">
              {[
                { label: 'Configurador PC', to: '/configurador' },
                { label: 'Componentes', to: '/productos' },
                { label: 'Laptops', to: '/productos' },
                { label: 'Periféricos', to: '/productos' },
              ].map(item => (
                <li key={item.label}>
                  <Link to={item.to} className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Soporte */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">Soporte</h3>
            <ul className="flex flex-col gap-2">
              {[
                { label: 'Estado del pedido', to: '/confirmacion' },
                { label: 'Garantías', to: '/soporte' },
                { label: 'Devoluciones', to: '/soporte' },
                { label: 'Contacto', to: '/contacto' },
                { label: 'Sobre Nosotros', to: '/nosotros' },
              ].map(item => (
                <li key={item.label}>
                  <Link to={item.to} className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">Boletín</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Recibe las últimas ofertas y novedades.</p>
            <div className="flex gap-2">
              <input
                className="w-full rounded bg-slate-100 dark:bg-background-dark border-none px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:ring-1 focus:ring-primary"
                placeholder="Tu email"
                type="email"
              />
              <button className="rounded bg-primary px-3 py-2 text-white hover:bg-blue-600 transition-colors">
                <span className="material-symbols-outlined text-[20px]">send</span>
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-border-dark pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">© 2024 TechStore. Todos los derechos reservados.</p>
          <div className="flex gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <img alt="Visa" className="h-4" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAI8oAkXsm9FFB8cdKz7Bmcr4PVQzLYU0uvbInmNSsOZLGBohsAlUy7OAgYLHzfIdvz3SBPizhkH38N_rB9BWIDosoLpCc4kZXIhz1ukU7ykZmaeByjk7YMrvlsthfhOxFuQfRoSAr5S8MJTEH-_1nuttTGX_lGyv9RCUgM1rLfyD5aI_v1xbWwfAFV_Mbv_TTvc5NQ9WDDVUljQCArqxx5rZKij-EMZ718rBHE8wpmkusVn4oyGCfEqZwcV3myFyyb9A3RF3u4ZN0" />
            <img alt="Mastercard" className="h-4" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAxZLyM0YDU6p5niw3G9e5JgYhUhwb9ssQvqrfDM0ToVHBhW0HUgwlUUl1uxkqnjGq6psX1H8UTBsNkKBaBzOCHXhCTkx4Bgl27s7zDxjEH0eXz_hDo_7MlkP_Iy-agaKSv96Y2Seib-6xDpqV5Y8OovJJfvE9jGpUIWEWglhs1_TUe5Ec2ZiG0rbRt8xrciSyFY9Hn3oUR1zPtq78_d0TwJpcaGXBdWe0cVTvURoZd9Ye_wrrHdvz58uWrOJKHxYS_Ws1xKlZeYQ" />
            <img alt="Paypal" className="h-4" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZSwaAS2Ovz4rVx92_4VFS5PlOIuDyCOdJxRniGXy5ulXTFnCOwQkjOlYqUQlHuiyZmcfQ_YBV7zwUcWwLExaNVvvu0855I-iPiQDgAdT8j6CKvc0DNXjMRV-hKLzPNhj2zCTkIfCPJr2QzRiGwamJs0NmhGxxnUs2wiSC4TsONTSG0CIas_0lFxw6MS33Qm0fZcKI-u7XDtqtSquWSiVYM1SXDPPVMEYM9IFaj_zDg7uRPbsSRs7TAAwGUxXoMD8HmY1Wc7xXSu4" />
          </div>
        </div>
      </div>
    </footer>
  )
}
