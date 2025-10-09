"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  FaMusic,
  FaPlus,
  FaTrash,
  FaSpinner,
  FaArrowLeft,
} from "react-icons/fa";
import Link from "next/link";

interface VotingOption {
  id: string;
  name: string;
  photoFile: File | null;
  musicFile: File | null;
}

export default function NewVotingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState<VotingOption[]>([
    { id: "1", name: "", photoFile: null, musicFile: null },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/admin/login");
    }
  }, [user, authLoading, router]);

  const addOption = () => {
    setOptions([
      ...options,
      { id: Date.now().toString(), name: "", photoFile: null, musicFile: null },
    ]);
  };

  const removeOption = (index: number) => {
    if (options.length > 1) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, field: string, value: any) => {
    const newOptions = [...options];
    (newOptions[index] as any)[field] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || options.some((opt) => !opt.name)) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);

      const optionsData = options.map((opt) => ({
        id: opt.id,
        name: opt.name,
      }));

      formData.append("options", JSON.stringify(optionsData));

      options.forEach((option, index) => {
        if (option.photoFile) {
          formData.append(`photo_${index}`, option.photoFile);
        }
        if (option.musicFile) {
          formData.append(`music_${index}`, option.musicFile);
        }
      });

      const response = await fetch("/api/votings", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("Votação criada com sucesso!");
        router.push("/admin");
      } else {
        const data = await response.json();
        alert(data.error || "Erro ao criar votação");
      }
    } catch (error) {
      console.error("Failed to create voting:", error);
      alert("Erro ao criar votação");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
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
        <div className="max-w-4xl mx-auto">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-gray-200 hover:text-white mb-4 transition-colors"
          >
            <FaArrowLeft />
            Voltar
          </Link>
          <div className="flex items-center gap-4">
            <FaMusic className="text-4xl" />
            <h1 className="text-3xl font-bold">Nova Votação</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <form
          onSubmit={handleSubmit}
          className="bg-gradient-stage rounded-2xl p-8"
        >
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Título da Votação *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-4">
              Opções de Voto
            </label>
            <div className="space-y-4">
              {options.map((option, index) => (
                <div
                  key={option.id}
                  className="bg-gray-900 bg-opacity-50 p-4 rounded-lg"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold">Opção {index + 1}</h4>
                    {options.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="text-red-500 hover:text-red-400"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>

                  <div className="mb-3">
                    <input
                      type="text"
                      value={option.name}
                      onChange={(e) =>
                        updateOption(index, "name", e.target.value)
                      }
                      placeholder="Nome do candidato *"
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">
                        Foto
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          updateOption(
                            index,
                            "photoFile",
                            e.target.files?.[0] || null
                          )
                        }
                        className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-600 file:text-white hover:file:bg-primary-700 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-1">
                        Música
                      </label>
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) =>
                          updateOption(
                            index,
                            "musicFile",
                            e.target.files?.[0] || null
                          )
                        }
                        className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-secondary-600 file:text-white hover:file:bg-secondary-700 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addOption}
              className="mt-4 flex items-center gap-2 bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-lg transition-colors"
            >
              <FaPlus />
              Adicionar Opção
            </button>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <FaSpinner className="animate-spin" />
                  Criando...
                </span>
              ) : (
                "Criar Votação"
              )}
            </button>

            <Link
              href="/admin"
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors text-center"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
