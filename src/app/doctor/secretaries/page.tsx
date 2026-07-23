"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Badge,
  Spinner,
} from "@/components/ui";
import {
  fetchSecretaries,
  registerSecretary,
  unlinkSecretary,
  Secretary,
} from "@/services/doctorService";
import useSWR, { mutate } from "swr";

const MAX_SECRETARIES = 2;

export default function SecretariesPage() {
  const { profile } = useAuth();
  const doctorId = profile?.id;

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    rut: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [unlinking, setUnlinking] = useState<string | null>(null);

  const { data: secretaries, isLoading } = useSWR(
    doctorId ? ["secretaries", doctorId] : null,
    () => fetchSecretaries(doctorId!)
  );

  const activeSecretaries = secretaries?.filter((s) => s.is_active) ?? [];
  const canAddMore = activeSecretaries.length < MAX_SECRETARIES;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.email.trim()) newErrors.email = "El email es requerido";
    if (!formData.password.trim()) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mínimo 6 caracteres";
    }
    if (!formData.first_name.trim()) newErrors.first_name = "El nombre es requerido";
    if (!formData.last_name.trim()) newErrors.last_name = "El apellido es requerido";
    if (!formData.rut.trim()) newErrors.rut = "El RUT es requerido";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !doctorId) return;

    setSubmitting(true);
    try {
      await registerSecretary(doctorId, formData);
      setFormData({ email: "", password: "", first_name: "", last_name: "", rut: "" });
      mutate(["secretaries", doctorId]);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error al registrar secretaria";
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnlink = async (secretaryId: string) => {
    if (!doctorId) return;
    if (!confirm("¿Está seguro de desvincular esta secretaria?")) return;

    setUnlinking(secretaryId);
    try {
      await unlinkSecretary(secretaryId);
      mutate(["secretaries", doctorId]);
    } catch {
      alert("Error al desvincular secretaria");
    } finally {
      setUnlinking(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Secretarias
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gestiona las secretarias asociadas a tu consulta (máximo {MAX_SECRETARIES})
        </p>
      </div>

      {/* Current secretaries list */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Secretarias actuales
            </h2>
            <Badge variant={canAddMore ? "success" : "warning"}>
              {activeSecretaries.length}/{MAX_SECRETARIES}
            </Badge>
          </div>
        </CardHeader>
        <CardBody>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : activeSecretaries.length === 0 ? (
            <p className="py-8 text-center text-gray-500 dark:text-gray-400">
              No hay secretarias registradas
            </p>
          ) : (
            <div className="space-y-3">
              {activeSecretaries.map((secretary: Secretary) => (
                <div
                  key={secretary.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-100 dark:bg-secondary-900/30">
                      <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                        {secretary.first_name[0]}{secretary.last_name[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {secretary.first_name} {secretary.last_name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {secretary.email} · {secretary.rut}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleUnlink(secretary.id)}
                    loading={unlinking === secretary.id}
                  >
                    Desvincular
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Register new secretary */}
      {canAddMore && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Registrar nueva secretaria
            </h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Nombre"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  error={errors.first_name}
                  placeholder="María"
                />
                <Input
                  label="Apellido"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  error={errors.last_name}
                  placeholder="González"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="RUT"
                  name="rut"
                  value={formData.rut}
                  onChange={handleChange}
                  error={errors.rut}
                  placeholder="12.345.678-9"
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  placeholder="secretaria@email.com"
                />
              </div>

              <div className="max-w-sm">
                <Input
                  label="Contraseña"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" loading={submitting}>
                  Registrar secretaria
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {!canAddMore && !isLoading && (
        <Card>
          <CardBody>
            <p className="text-center text-gray-600 dark:text-gray-400">
              Has alcanzado el máximo de {MAX_SECRETARIES} secretarias activas.
              Desvincula una para agregar una nueva.
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
