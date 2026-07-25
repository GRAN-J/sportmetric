// =============================================================================
// Formulario Dinámico (basado en esquema JSONB del backend)
// =============================================================================
// Renderiza el instrumento de registro cuyo esquema proviene del backend.
// El backend garantiza que la Ficha Técnica base (Nombre del evaluado y
// Nombre del evaluador) siempre está presente, seguida de los campos
// personalizados definidos por el administrador (si los hay).
// =============================================================================

import { useState, useMemo } from 'react';
import { Save, AlertCircle, Loader2, Info } from 'lucide-react';
import { saveEvaluation } from '../services/formService';

/**
 * Convierte el valor del input al tipo declarado por el campo.
 */
const coerceValue = (value, type) => {
  if (value === '' || value === undefined || value === null) {
    return type === 'checkbox' ? false : '';
  }
  if (type === 'number') return Number(value);
  if (type === 'checkbox') return Boolean(value);
  return value;
};

/**
 * Renderiza un campo individual del esquema.
 */
const Field = ({ field, value, onChange }) => {
  const commonProps = {
    id: field.name,
    name: field.name,
    value: value ?? '',
    onChange: (e) => onChange(field.name, e.target.value, e.target.type),
    required: field.required,
    className:
      'block w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm',
  };

  if (field.type === 'textarea') {
    return (
      <textarea
        {...commonProps}
        rows={3}
        placeholder={field.placeholder || ''}
        value={value ?? ''}
      />
    );
  }

  if (field.type === 'select') {
    return (
      <select {...commonProps} value={value ?? ''}>
        <option value="">Selecciona una opción</option>
        {(field.options || []).map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    );
  }

  if (field.type === 'checkbox') {
    return (
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          id={field.name}
          name={field.name}
          checked={Boolean(value)}
          onChange={(e) => onChange(field.name, e.target.checked, 'checkbox')}
          className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
        />
        <span className="text-sm text-gray-700">{field.checkboxLabel || 'Sí'}</span>
      </label>
    );
  }

  return (
    <input
      {...commonProps}
      type={field.type || 'text'}
      min={field.min}
      max={field.max}
      step={field.step}
      placeholder={field.placeholder || ''}
    />
  );
};

/**
 * Renderiza el formulario en sí. Se monta como componente independiente y se
 * remonta automáticamente (vía `key`) cada vez que cambia el esquema, lo que
 * evita resetear el estado con un `setState` dentro de un `useEffect`.
 *
 * Importante: este componente NO recibe `studentId` porque la captura es
 * pública y el identificador del evaluado viaja dentro de `results.id_estudiante`
 * (campo de la Ficha Técnica base).
 */
const DynamicFormInner = ({ protocolId, schema, onSaveSuccess }) => {
  const [formData, setFormData] = useState(() => {
    const initial = {};
    (schema?.fields || []).forEach((field) => {
      if (field.type === 'checkbox') initial[field.name] = false;
      else initial[field.name] = '';
    });
    return initial;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (name, value, inputType) => {
    setFormData((prev) => {
      const field = schema?.fields.find((f) => f.name === name);
      const finalValue = inputType === 'checkbox' ? value : coerceValue(value, field?.type);
      return { ...prev, [name]: finalValue };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!schema?.fields) return;

    // Validación local: revisa campos requeridos vacíos.
    const faltantes = schema.fields
      .filter((f) => f.required && (formData[f.name] === '' || formData[f.name] === undefined || formData[f.name] === null))
      .map((f) => f.label || f.name);

    if (faltantes.length > 0) {
      setError(`Campos obligatorios sin completar: ${faltantes.join(', ')}`);
      return;
    }

    setSaving(true);
    setError('');

    try {
      await saveEvaluation({
        protocolId,
        results: formData,
      });
      if (onSaveSuccess) onSaveSuccess();
    } catch (err) {
      setError(err.message || 'Error al guardar la evaluación.');
    } finally {
      setSaving(false);
    }
  };

  const requiredCount = useMemo(
    () => schema?.fields?.filter((f) => f.required).length ?? 0,
    [schema]
  );

  const customCount = useMemo(
    () => (schema?.isGeneric ? 0 : Math.max(0, (schema?.fields?.length ?? 0) - 3)),
    [schema]
  );

  // El separador visual de "Campos personalizados" aparece después de los
  // campos base de la Ficha Técnica (id_estudiante, evaluado, evaluador).
  const GENERIC_FIELD_COUNT = 3;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm">
        <Info size={16} className="mt-0.5 shrink-0" />
        <p>
          {customCount > 0
            ? `Este protocolo incluye los datos básicos más ${customCount} campo${customCount === 1 ? '' : 's'} personalizado${customCount === 1 ? '' : 's'}.`
            : 'Este protocolo utiliza el formulario base. Complete el ID del estudiante, el nombre del evaluado y el del evaluador.'}
          {requiredCount > 0 && ` (${requiredCount} ${requiredCount === 1 ? 'campo obligatorio' : 'campos obligatorios'})`}
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
        {schema.fields.map((field, index) => {
          // Marca visual de separación entre Ficha Técnica base y campos personalizados.
          const isFirstCustom = !schema.isGeneric && index === GENERIC_FIELD_COUNT;

          return (
            <div
              key={field.name}
              className={field.type === 'textarea' || field.type === 'checkbox' ? 'sm:col-span-2' : ''}
            >
              {isFirstCustom && (
                <div className="sm:col-span-2 mb-2 mt-4 pb-2 border-b border-gray-200">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                    Campos personalizados
                  </h4>
                </div>
              )}
              <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
                {field.unit && <span className="text-gray-400 ml-1">({field.unit})</span>}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <Field field={field} value={formData[field.name]} onChange={handleChange} />
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button
          type="submit"
          disabled={saving}
          className={`inline-flex items-center gap-2 justify-center py-2.5 px-5 border border-transparent shadow-sm text-sm font-bold rounded-lg text-white ${
            saving ? 'bg-teal-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500`}
        >
          {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          {saving ? 'Guardando...' : 'Guardar Evaluación'}
        </button>
      </div>
    </form>
  );
};

/**
 * Componente público: usa la prop `schema` provista por el padre y se
 * encarga de remontar el formulario cuando el esquema cambia.
 *
 * La captura es pública: NO se pide `studentId` (el identificador del
 * evaluado viaja en `results.id_estudiante`).
 */
const DynamicForm = ({ protocolId, schema, onSaveSuccess }) => {
  const schemaKey = useMemo(() => {
    if (!schema?.fields) return 'empty';
    return schema.fields.map((f) => `${f.name}:${f.type}:${f.required ? 1 : 0}`).join('|');
  }, [schema]);

  if (!schema?.fields) {
    return null;
  }

  return (
    <DynamicFormInner
      key={schemaKey}
      protocolId={protocolId}
      schema={schema}
      onSaveSuccess={onSaveSuccess}
    />
  );
};

export default DynamicForm;
