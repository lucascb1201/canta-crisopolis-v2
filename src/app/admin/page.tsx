"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  FaMusic,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaUnlock,
  FaSignOutAlt,
  FaSpinner,
} from "react-icons/fa";
import Link from "next/link";

interface VotingOption {
  id: string;
  name: string;
  photoUrl?: string;
  musicUrl?: string;
  votes: number;
}

interface Voting {
  _id: string;
  title: string;
  description?: string;
  options: VotingOption[];
  isVisible: boolean;
  isClosed: boolean;
  showResults: boolean;
}

export default function AdminPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [votings, setVotings] = useState<Voting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/admin/login");
    } else if (user) {
      loadVotings();
    }
  }, [user, authLoading, router]);

  const loadVotings = async () => {
    try {
      const response = await fetch("/api/votings?admin=true");
      const data = await response.json();
      setVotings(data.votings);
    } catch (error) {
      console.error("Failed to load votings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta votação?")) return;

    try {
      const response = await fetch(`/api/votings/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        loadVotings();
      } else {
        alert("Erro ao excluir votação");
      }
    } catch (error) {
      console.error("Failed to delete voting:", error);
      alert("Erro ao excluir votação");
    }
  };

  // Os três toggles só alternam uma flag; o resto da votação vai junto
  // inalterado para não sobrescrever nada no PUT.
  const patchVoting = async (
    voting: Voting,
    changes: Partial<Pick<Voting, "isVisible" | "isClosed" | "showResults">>
  ) => {
    try {
      const response = await fetch(`/api/votings/${voting._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: voting.title,
          description: voting.description,
          isVisible: voting.isVisible,
          isClosed: voting.isClosed,
          showResults: voting.showResults,
          ...changes,
        }),
      });

      if (response.ok) {
        loadVotings();
      } else {
        alert("Erro ao atualizar votação");
      }
    } catch (error) {
      console.error("Failed to update voting:", error);
    }
  };

  const toggleVisibility = (voting: Voting) =>
    patchVoting(voting, { isVisible: !voting.isVisible });

  const toggleClosed = (voting: Voting) =>
    patchVoting(voting, { isClosed: !voting.isClosed });

  const toggleResults = (voting: Voting) =>
    patchVoting(voting, { showResults: !voting.showResults });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-primary-500" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-music py-8 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <FaMusic className="text-4xl" />
            <div>
              <h1 className="text-3xl font-bold">Painel Administrativo</h1>
              <p className="text-gray-200">Bem-vindo, {user.username}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors"
          >
            <FaSignOutAlt />
            Sair
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Votações</h2>
          <Link
            href="/admin/votings/new"
            className="flex items-center gap-2 bg-gradient-to-r from-primary-500 to-secondary-500 px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            <FaPlus />
            Nova Votação
          </Link>
        </div>

        {votings.length === 0 ? (
          <div className="text-center py-20">
            <FaMusic className="text-6xl mx-auto mb-4 text-gray-600" />
            <p className="text-xl text-gray-400 mb-6">
              Nenhuma votação criada ainda
            </p>
            <Link
              href="/admin/votings/new"
              className="inline-flex items-center gap-2 bg-primary-500 px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
            >
              <FaPlus />
              Criar primeira votação
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {votings.map((voting) => (
              <div
                key={voting._id}
                className="bg-gradient-stage rounded-xl p-6 border border-gray-700"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2">{voting.title}</h3>
                    {voting.description && (
                      <p className="text-gray-400">{voting.description}</p>
                    )}
                    <div className="flex gap-2 mt-3">
                      {voting.isVisible ? (
                        <span className="px-3 py-1 bg-green-500 bg-opacity-20 border border-green-500 text-green-400 rounded-full text-sm">
                          Visível
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-500 bg-opacity-20 border border-gray-500 text-gray-400 rounded-full text-sm">
                          Oculta
                        </span>
                      )}
                      {voting.isClosed ? (
                        <span className="px-3 py-1 bg-red-500 bg-opacity-20 border border-red-500 text-red-400 rounded-full text-sm">
                          Fechada
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-blue-500 bg-opacity-20 border border-blue-500 text-blue-400 rounded-full text-sm">
                          Aberta
                        </span>
                      )}
                      {voting.showResults && (
                        <span className="px-3 py-1 bg-purple-500 bg-opacity-20 border border-purple-500 text-purple-400 rounded-full text-sm">
                          Resultados Visíveis
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/votings/${voting._id}`}
                      className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <FaEdit />
                    </Link>
                    <button
                      onClick={() => toggleVisibility(voting)}
                      className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                      title={voting.isVisible ? "Ocultar" : "Tornar visível"}
                    >
                      {voting.isVisible ? <FaEye /> : <FaEyeSlash />}
                    </button>
                    <button
                      onClick={() => toggleClosed(voting)}
                      className="p-2 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
                      title={
                        voting.isClosed ? "Abrir votação" : "Fechar votação"
                      }
                    >
                      {voting.isClosed ? <FaUnlock /> : <FaLock />}
                    </button>
                    <button
                      onClick={() => toggleResults(voting)}
                      className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                      title={
                        voting.showResults
                          ? "Ocultar resultados"
                          : "Mostrar resultados"
                      }
                    >
                      {voting.showResults ? <FaEye /> : <FaEyeSlash />}
                    </button>
                    <button
                      onClick={() => handleDelete(voting._id)}
                      className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-400 mb-2">
                    {voting.options.length} opções • Total de{" "}
                    {voting.options.reduce((sum, opt) => sum + opt.votes, 0)}{" "}
                    votos
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {voting.options.map((option) => (
                      <div
                        key={option.id}
                        className="bg-gray-900 bg-opacity-50 p-3 rounded-lg"
                      >
                        <p className="font-medium truncate">{option.name}</p>
                        <p className="text-sm text-gray-400">
                          {option.votes} votos
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
