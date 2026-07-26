// =============================================================================
// Repositorio de Protocolos
// =============================================================================
// Se encarga de interactuar directamente con la base de datos usando Prisma
// =============================================================================

import prisma from '../../../config/database';
import { ProtocolDTO, ProtocolListItemDTO } from '../dto/protocol.dto';

/**
 * Obtiene todos los protocolos de todas las categorías
 */
export async function getAllProtocols(): Promise<ProtocolListItemDTO[]> {
  const protocols = await prisma.protocol.findMany({
    orderBy: [{ categoryId: 'asc' }, { order: 'asc' }],
  });

  return protocols.map((protocol) => ({
    id: protocol.id,
    categoryId: protocol.categoryId,
    order: protocol.order,
    title: protocol.title,
    objective: protocol.objective,
    description: protocol.description,
  }));
}

/**
 * Obtiene todos los protocolos de una categoría (solo datos básicos para la lista)
 */
export async function getProtocolsByCategory(
  categoryId: string
): Promise<ProtocolListItemDTO[]> {
  const protocols = await prisma.protocol.findMany({
    where: { categoryId },
    orderBy: { order: 'asc' },
  });

  return protocols.map((protocol) => ({
    id: protocol.id,
    categoryId: protocol.categoryId,
    order: protocol.order,
    title: protocol.title,
    objective: protocol.objective,
    description: protocol.description,
  }));
}

/**
 * Obtiene un protocolo completo por ID (con todas las relaciones)
 */
export async function getProtocolById(id: string): Promise<ProtocolDTO | null> {
  const protocol = await prisma.protocol.findUnique({
    where: { id },
    include: {
      materials: { orderBy: { order: 'asc' } },
      checklistItems: { orderBy: { order: 'asc' } },
      steps: { orderBy: { order: 'asc' } },
      interruptionCrit: { orderBy: { order: 'asc' } },
      dataRegistry: true,
      formSchema: true,
    },
  });

  if (!protocol) return null;

  return {
    id: protocol.id,
    categoryId: protocol.categoryId,
    order: protocol.order,
    title: protocol.title,
    objective: protocol.objective,
    description: protocol.description,
    materials: protocol.materials.map((m) => ({
      id: m.id,
      name: m.name,
      imageUrl: m.imageUrl,
      order: m.order,
    })),
    checklistItems: protocol.checklistItems.map((c) => ({
      id: c.id,
      text: c.text,
      order: c.order,
    })),
    steps: protocol.steps.map((s) => ({
      id: s.id,
      stepNumber: s.stepNumber,
      title: s.title,
      description: s.description,
      videoUrl: s.videoUrl,
      order: s.order,
    })),
    interruptionCrit: protocol.interruptionCrit.map((i) => ({
      id: i.id,
      text: i.text,
      order: i.order,
    })),
    dataRegistry: protocol.dataRegistry
      ? {
          id: protocol.dataRegistry.id,
          title: protocol.dataRegistry.title,
          description: protocol.dataRegistry.description,
          unit: protocol.dataRegistry.unit,
        }
      : null,
    formSchema: protocol.formSchema
      ? {
          id: protocol.formSchema.id,
          fields: Array.isArray(protocol.formSchema.fields)
            ? (protocol.formSchema.fields as any[]).filter(
                (f) => f && typeof f === 'object' && f.name && f.label
              )
            : [],
        }
      : null,
  };
};

// -----------------------------------------------------------------------------
// Helpers internos para crear/actualizar las relaciones del protocolo
// -----------------------------------------------------------------------------

/**
 * Construye los payloads de Prisma para las relaciones de un protocolo.
 * Filtra items vacíos para mantener la BD limpia.
 */
const buildRelations = (data: any) => {
  const materials = Array.isArray(data.materials)
    ? data.materials
        .filter((m: any) => m && m.name && m.name.trim())
        .map((m: any, idx: number) => ({
          name: m.name.trim(),
          imageUrl: m.imageUrl?.trim() || null,
          order: m.order ?? idx,
        }))
    : [];

  const checklistItems = Array.isArray(data.checklistItems)
    ? data.checklistItems
        .filter((c: any) => c && c.text && c.text.trim())
        .map((c: any, idx: number) => ({
          text: c.text.trim(),
          order: c.order ?? idx,
        }))
    : [];

  const steps = Array.isArray(data.steps)
    ? data.steps
        .filter((s: any) => s && s.title && s.title.trim())
        .map((s: any, idx: number) => ({
          stepNumber: s.stepNumber ?? idx + 1,
          title: s.title.trim(),
          description: s.description?.trim() || '',
          videoUrl: s.videoUrl?.trim() || null,
          order: s.order ?? idx,
        }))
    : [];

  const interruptionCrit = Array.isArray(data.interruptionCrit)
    ? data.interruptionCrit
        .filter((c: any) => c && c.text && c.text.trim())
        .map((c: any, idx: number) => ({
          text: c.text.trim(),
          order: c.order ?? idx,
        }))
    : [];

  return { materials, checklistItems, steps, interruptionCrit };
};

/**
 * Sincroniza el dataRegistry (1:1) con la información del payload.
 * Si no hay contenido, elimina el registro existente.
 * Acepta el cliente de transacción para mantener atomicidad.
 */
const syncDataRegistry = async (
  tx: any,
  protocolId: string,
  registry: any
) => {
  const hasContent =
    registry && (registry.title?.trim() || registry.description?.trim());

  if (!hasContent) {
    await tx.dataRegistry.deleteMany({ where: { protocolId } });
    return;
  }

  await tx.dataRegistry.upsert({
    where: { protocolId },
    update: {
      title: registry.title?.trim() || '',
      description: registry.description?.trim() || '',
      unit: registry.unit?.trim() || null,
    },
    create: {
      protocolId,
      title: registry.title?.trim() || '',
      description: registry.description?.trim() || '',
      unit: registry.unit?.trim() || null,
    },
  });
};

/**
 * Sincroniza el FormSchema (1:1) con los campos personalizados del payload.
 * - Si el array de campos está vacío, elimina el esquema.
 * - Si trae campos, hace upsert con el JSON.
 * Acepta el cliente de transacción para mantener atomicidad.
 */
const syncFormSchema = async (
  tx: any,
  protocolId: string,
  formSchema: any
) => {
  const fields = Array.isArray(formSchema?.fields) ? formSchema.fields : [];

  if (fields.length === 0) {
    await tx.formSchema.deleteMany({ where: { protocolId } });
    return;
  }

  // Limpia campos vacíos y normaliza la estructura
  const cleanFields = fields
    .filter((f: any) => f && f.name && f.name.trim() && f.label && f.label.trim())
    .map((f: any) => ({
      name: f.name.trim(),
      label: f.label.trim(),
      type: f.type || 'text',
      required: Boolean(f.required),
      placeholder: f.placeholder?.trim() || '',
      unit: f.unit?.trim() || '',
      options: Array.isArray(f.options) ? f.options.filter((o: any) => o && o.toString().trim()) : [],
      checkboxLabel: f.checkboxLabel?.trim() || '',
    }));

  if (cleanFields.length === 0) {
    await tx.formSchema.deleteMany({ where: { protocolId } });
    return;
  }

  await tx.formSchema.upsert({
    where: { protocolId },
    update: { fields: cleanFields as any },
    create: { protocolId, fields: cleanFields as any },
  });
};

/**
 * Crea un protocolo con todas sus relaciones en una sola transacción.
 */
export async function create(data: any) {
  const relations = buildRelations(data);

  return prisma.$transaction(async (tx) => {
    // Calcula el orden si no viene definido
    let order = data.order;
    if (order === undefined || order === null) {
      const count = await tx.protocol.count({ where: { categoryId: data.categoryId } });
      order = count;
    }

    const protocol = await tx.protocol.create({
      data: {
        id: data.id,
        categoryId: data.categoryId,
        title: data.title,
        objective: data.objective,
        description: data.description,
        order,
        materials: { create: relations.materials },
        checklistItems: { create: relations.checklistItems },
        steps: { create: relations.steps },
        interruptionCrit: { create: relations.interruptionCrit },
      },
    });

    await syncDataRegistry(tx, protocol.id, data.dataRegistry);
    await syncFormSchema(tx, protocol.id, data.formSchema);

    return protocol;
  });
}

/**
 * Actualiza un protocolo y todas sus relaciones en una sola transacción.
 * Estrategia: borrar las relaciones existentes y volver a crearlas.
 */
export async function update(id: string, data: any) {
  const relations = buildRelations(data);

  return prisma.$transaction(async (tx) => {
    const protocol = await tx.protocol.update({
      where: { id },
      data: {
        categoryId: data.categoryId,
        title: data.title,
        objective: data.objective,
        description: data.description,
      },
    });

    // Reemplaza las relaciones: elimina y vuelve a crear
    await Promise.all([
      tx.material.deleteMany({ where: { protocolId: id } }),
      tx.checklistItem.deleteMany({ where: { protocolId: id } }),
      tx.step.deleteMany({ where: { protocolId: id } }),
      tx.interruptionCriterion.deleteMany({ where: { protocolId: id } }),
    ]);

    await Promise.all([
      relations.materials.length > 0
        ? tx.material.createMany({ data: relations.materials.map((m: any) => ({ ...m, protocolId: id })) })
        : Promise.resolve(),
      relations.checklistItems.length > 0
        ? tx.checklistItem.createMany({ data: relations.checklistItems.map((c: any) => ({ ...c, protocolId: id })) })
        : Promise.resolve(),
      relations.steps.length > 0
        ? tx.step.createMany({ data: relations.steps.map((s: any) => ({ ...s, protocolId: id })) })
        : Promise.resolve(),
      relations.interruptionCrit.length > 0
        ? tx.interruptionCriterion.createMany({ data: relations.interruptionCrit.map((c: any) => ({ ...c, protocolId: id })) })
        : Promise.resolve(),
    ]);

    await syncDataRegistry(tx, id, data.dataRegistry);
    await syncFormSchema(tx, id, data.formSchema);

    return protocol;
  });
}

/**
 * Elimina un protocolo (las relaciones se eliminan en cascada)
 */
export async function remove(id: string) {
  return prisma.protocol.delete({
    where: { id },
  });
}
