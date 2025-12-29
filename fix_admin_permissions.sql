-- PERMISOS PARA TABLA PROFILES (Administradores)

-- Habilitar RLS en profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Permitir que usuarios autenticados lean su propio perfil
CREATE POLICY "Usuarios pueden ver su propio perfil" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- Permitir que admins lean todos los perfiles (opcional)
CREATE POLICY "Admins pueden ver todos los perfiles" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND rol = 'admin'
  )
);

-- Si prefieres deshabilitar RLS temporalmente para probar:
-- ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
