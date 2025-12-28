-- PERMISOS PARA "LOGIN SENCILLO" (Permitir acceso público/anónimo)

-- 1. CLIENTES: Permitir registrarse y buscarse por teléfono
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir insertar clientes anonimos" 
ON public.clientes FOR INSERT 
TO anon 
WITH CHECK (true);

CREATE POLICY "Permitir leer clientes anonimos" 
ON public.clientes FOR SELECT 
TO anon 
USING (true);

-- 2. CITAS (APPOINTMENTS): Permitir crear y ver citas
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir crear citas anonimos" 
ON public.appointments FOR INSERT 
TO anon 
WITH CHECK (true);

CREATE POLICY "Permitir ver citas clientes"     
ON public.appointments FOR SELECT 
TO anon 
USING (true);

CREATE POLICY "Permitir cancelar citas clientes"     
ON public.appointments FOR UPDATE
TO anon 
USING (true);

-- 3. LECTURA PÚBLICA DE CONFIGURACIÓN
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Publico ver barberos" ON public.barbers FOR SELECT TO anon USING (true);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Publico ver servicios" ON public.services FOR SELECT TO anon USING (true);

-- NOTA: Si prefieres deshabilitar la seguridad por completo (más fácil pero menos seguro):
-- ALTER TABLE public.clientes DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.appointments DISABLE ROW LEVEL SECURITY;
