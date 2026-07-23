"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardBody, CardHeader, Button, Spinner } from "@/components/ui";
import { api } from "@/lib/api";
import useSWR, { mutate } from "swr";

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

interface DoctorContact {
  id: string;
  first_name: string;
  last_name: string;
  especialidad?: string;
}

export default function PatientMessagesPage() {
  const { profile } = useAuth();
  const patientId = profile?.id;

  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSelectDoctor = async (docId: string) => {
    setSelectedDoctorId(docId);
    // Mark unread messages from this doctor as read
    const unreadFromDoctor = (Array.isArray(inbox) ? inbox : []).filter(
      (msg) => msg.sender_id === docId && !msg.is_read
    );
    for (const msg of unreadFromDoctor) {
      try { await api.patch(`/api/messages/${msg.id}/read`); } catch { /* ignore */ }
    }
    if (unreadFromDoctor.length > 0) {
      mutate(["messages-inbox", patientId]);
    }
  };

  // Fetch doctors who have attended this patient
  const { data: myDoctors, isLoading: loadingMyDoctors } = useSWR(
    patientId ? ["patient-doctors-contacts", patientId] : null,
    () => api.get<DoctorContact[]>("/api/patients/my-doctors")
  );

  // Fetch inbox messages
  const { data: inbox, isLoading: loadingInbox } = useSWR(
    patientId ? ["messages-inbox", patientId] : null,
    async () => {
      const result = await api.get<{ data: Message[]; pagination: unknown }>("/api/messages/inbox?limit=100");
      return result.data ?? [];
    }
  );

  // Fetch sent messages
  const { data: sent } = useSWR(
    patientId ? ["messages-sent", patientId] : null,
    async () => {
      const result = await api.get<{ data: Message[]; pagination: unknown }>("/api/messages/sent?limit=100");
      return result.data ?? [];
    }
  );

  const contacts = myDoctors || [];

  // Combine and filter messages for selected doctor
  const conversation = [...(Array.isArray(inbox) ? inbox : []), ...(Array.isArray(sent) ? sent : [])]
    .filter((msg) =>
      selectedDoctorId
        ? msg.sender_id === selectedDoctorId || msg.recipient_id === selectedDoctorId
        : false
    )
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const handleSend = async () => {
    if (!selectedDoctorId || !newMessage.trim()) return;

    setSending(true);
    try {
      await api.post("/api/messages", {
        recipient_id: selectedDoctorId,
        content: newMessage.trim(),
      });
      setNewMessage("");
      mutate(["messages-sent", patientId]);
      mutate(["messages-inbox", patientId]);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al enviar mensaje");
    } finally {
      setSending(false);
    }
  };

  // Count unread messages per sender
  const unreadBySender = useMemo(() => {
    const map = new Map<string, number>();
    (Array.isArray(inbox) ? inbox : []).forEach((msg) => {
      if (!msg.is_read) {
        map.set(msg.sender_id, (map.get(msg.sender_id) || 0) + 1);
      }
    });
    return map;
  }, [inbox]);

  const totalUnread = useMemo(() => {
    let count = 0;
    unreadBySender.forEach((v) => { count += v; });
    return count;
  }, [unreadBySender]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mensajes</h1>
          <p className="text-gray-600 dark:text-gray-400">Comunícate con tus doctores</p>
        </div>
        {totalUnread > 0 && (
          <div className="flex items-center gap-2">
            <svg className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {totalUnread}
            </span>
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Contacts */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Mis Doctores</h2>
          </CardHeader>
          <CardBody className="max-h-[500px] overflow-y-auto p-0">
            {loadingMyDoctors ? (
              <div className="flex justify-center py-4"><Spinner /></div>
            ) : contacts.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                No tienes doctores que te hayan atendido
              </p>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {contacts.map((doc: DoctorContact) => (
                  <button
                    key={doc.id}
                    onClick={() => handleSelectDoctor(doc.id)}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                      selectedDoctorId === doc.id ? "bg-primary-50 dark:bg-primary-900/20" : ""
                    }`}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                      <span className="text-xs font-medium text-green-700 dark:text-green-300">
                        {doc.first_name[0]}{doc.last_name[0]}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Dr. {doc.first_name} {doc.last_name}
                      </p>
                      {doc.especialidad && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">{doc.especialidad}</p>
                      )}
                    </div>
                    {unreadBySender.has(doc.id) && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {unreadBySender.get(doc.id)}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Conversation */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              {selectedDoctorId
                ? `Conversación con Dr. ${contacts.find((d: DoctorContact) => d.id === selectedDoctorId)?.first_name || ""}`
                : "Selecciona un doctor"}
            </h2>
          </CardHeader>
          <CardBody className="flex flex-col">
            {!selectedDoctorId ? (
              <p className="py-12 text-center text-gray-500 dark:text-gray-400">
                Selecciona un doctor para ver la conversación
              </p>
            ) : loadingInbox ? (
              <div className="flex justify-center py-8"><Spinner /></div>
            ) : (
              <>
                {/* Messages */}
                <div className="flex-1 space-y-3 overflow-y-auto max-h-[350px] mb-4">
                  {conversation.length === 0 ? (
                    <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                      No hay mensajes. Envía el primero.
                    </p>
                  ) : (
                    conversation.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender_id === patientId ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-2 text-sm ${
                            msg.sender_id === patientId
                              ? "bg-primary-600 text-white"
                              : "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                          <p className={`mt-1 text-xs ${msg.sender_id === patientId ? "text-primary-200" : "text-gray-400"}`}>
                            {new Date(msg.created_at).toLocaleString("es-CL", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Input */}
                <div className="flex gap-2 border-t border-gray-200 pt-3 dark:border-gray-700">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    rows={2}
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  />
                  <Button
                    variant="primary"
                    onClick={handleSend}
                    loading={sending}
                    disabled={!newMessage.trim()}
                  >
                    Enviar
                  </Button>
                </div>
              </>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
