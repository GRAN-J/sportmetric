import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { categories } from '../data/categories';
import * as Icons from 'lucide-react';

const CategoryCard = ({ category, index, onClick }) => {
  const Icon = Icons[category.icon] || Icons.Activity;
  return (
    <motion.div
      key={category.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onClick}
      className="group cursor-pointer bg-white rounded-xl border border-outline-variant p-6 shadow-card hover:shadow-lg transition-all hover:-translate-y-1 flex flex-col gap-4 relative overflow-hidden"
    >
      <div className={`absolute top-0 left-0 right-0 h-1 ${category.color}`} />

      <div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center text-white shadow-sm`}>
        <Icon size={24} />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-primary leading-tight group-hover:text-teal-accent transition-colors">
          {category.title}
        </h2>
        <p className="text-sm text-on-surface-variant leading-relaxed">
          {category.description}
        </p>
      </div>

      <div className="mt-auto flex items-center text-xs font-bold text-primary uppercase tracking-widest gap-2 group-hover:gap-3 transition-all">
        Explorar Protocolos
        <Icons.ArrowRight size={14} />
      </div>
    </motion.div>
  );
};

// Pantalla de categorías oficiales.
// - Muestra las 5 categorías aprobadas.
// - Cada tarjeta dirige a la lista de protocolos de la categoría.
const Categories = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-primary">Categorías Académicas</h1>
        <p className="text-on-surface-variant">Selecciona una categoría para explorar los protocolos técnicos disponibles.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category, index) => (
          <CategoryCard
            key={category.id}
            category={category}
            index={index}
            onClick={() => navigate(`/category/${category.id}`)}
          />
        ))}
      </div>
    </div>
  );
};

export default Categories;
