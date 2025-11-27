const DashboardLoader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          {/* Logo principal con animación de pulso */}
          <img 
            src="/logo.png" 
            alt="IH Ingles Academy" 
            className="h-20 w-auto animate-pulse"
          />
          
          {/* Círculo animado alrededor */}
          <div className="absolute inset-0 -m-4">
            <div className="w-full h-full border-4 border-primary/20 rounded-full animate-spin" 
                 style={{ 
                   borderTopColor: 'hsl(var(--primary))',
                   animationDuration: '2s'
                 }} 
            />
          </div>
        </div>
        
        <div className="flex flex-col items-center gap-2">
          <p className="text-lg font-medium text-foreground animate-pulse">
            Cargando tu panel...
          </p>
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLoader;
