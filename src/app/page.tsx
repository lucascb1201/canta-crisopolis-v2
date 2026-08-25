"use client";

import { useEffect, useState } from "react";
import { useDeviceFingerprint } from "@/hooks/useDeviceFingerprint";
import { FaMusic, FaCheckCircle, FaSpinner } from "react-icons/fa";
import Link from "next/link";
import MusicPlayer from "@/components/MusicPlayer";
import { toPublicMediaUrl } from "@/lib/media";

interface VotingOption {
  id: string;
  name: string;
  photoUrl?: string;
  musicUrl?: string;
  votes?: number;
}

interface Voting {
  _id: string;
  title: string;
  description?: string;
  options: VotingOption[];
  isClosed: boolean;
  showResults: boolean;
}

export default function Home() {
  const [votings, setVotings] = useState<Voting[]>([]);
  const [loading, setLoading] = useState(true);
  const [votedPolls, setVotedPolls] = useState<Record<string, string>>({});
  const [selectedOption, setSelectedOption] = useState<Record<string, string>>(
    {}
  );
  const [voting, setVoting] = useState<Record<string, boolean>>({});
  const { fingerprint } = useDeviceFingerprint();

  useEffect(() => {
    loadVotings();
  }, []);

  // A chave são os ids, não o array: atualizar contagens localmente após um
  // voto não deve disparar uma nova consulta.
  const votingIdsKey = votings.map((poll) => poll._id).join(",");

  useEffect(() => {
    if (fingerprint && votings.length > 0) {
      checkVotes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fingerprint, votingIdsKey]);

  const loadVotings = async () => {
    try {
      const response = await fetch("/api/votings");
      const data = await response.json();
      setVotings(data.votings);
    } catch (error) {
      console.error("Failed to load votings:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkVotes = async () => {
    if (!fingerprint || votings.length === 0) return;

    try {
      const response = await fetch("/api/votes/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceFingerprint: fingerprint,
          votingIds: votings.map((poll) => poll._id),
        }),
      });

      const data = await response.json();
      setVotedPolls(data.votes ?? {});
    } catch (error) {
      console.error("Failed to check votes:", error);
    }
  };

  const handleVote = async (votingId: string) => {
    if (!fingerprint || !selectedOption[votingId]) return;

    setVoting({ ...voting, [votingId]: true });

    try {
      const response = await fetch(`/api/votings/${votingId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          optionId: selectedOption[votingId],
          deviceFingerprint: fingerprint,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Failed to vote");
      } else {
        const optionId = selectedOption[votingId];

        setVotedPolls({ ...votedPolls, [votingId]: optionId });

        // Atualiza a contagem localmente em vez de recarregar tudo: recarregar
        // custaria uma listagem e uma nova consulta de votos por votante.
        setVotings((polls) =>
          polls.map((poll) =>
            poll._id !== votingId
              ? poll
              : {
                  ...poll,
                  options: poll.options.map((option) =>
                    option.id === optionId && option.votes !== undefined
                      ? { ...option, votes: option.votes + 1 }
                      : option
                  ),
                }
          )
        );

        alert("Voto registrado com sucesso!");
      }
    } catch (error) {
      console.error("Failed to vote:", error);
      alert("Erro ao votar. Tente novamente.");
    } finally {
      setVoting({ ...voting, [votingId]: false });
    }
  };

  const getTotalVotes = (options: VotingOption[]) => {
    return options.reduce((sum, opt) => sum + (opt.votes ?? 0), 0);
  };

  const getPercentage = (votes: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-music py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <FaMusic className="text-6xl mx-auto mb-6 animate-float" />
          <h1 className="text-5xl font-bold mb-4">Canta Crisópolis</h1>
          <p className="text-xl text-gray-200 mb-8">
            Vote nos seus artistas favoritos e ajude a escolher os melhores!
          </p>
          <Link
            href="/register"
            className="inline-block bg-white text-primary-700 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
          >
            Inscreva-se no Concurso
          </Link>
        </div>
      </div>

      {/* Votings Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {votings.length === 0 ? (
          <div className="text-center py-20">
            <FaMusic className="text-6xl mx-auto mb-4 text-gray-500" />
            <p className="text-xl text-gray-400">
              Nenhuma votação disponível no momento.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {votings.map((poll) => {
              const hasVoted = !!votedPolls[poll._id];
              const canShowResults = poll.showResults || poll.isClosed;
              const totalVotes = getTotalVotes(poll.options);

              return (
                <div
                  key={poll._id}
                  className="bg-gradient-stage rounded-2xl p-8 shadow-2xl border border-primary-800"
                >
                  <div className="mb-6">
                    <h2 className="text-3xl font-bold mb-2">{poll.title}</h2>
                    {poll.description && (
                      <p className="text-gray-300">{poll.description}</p>
                    )}
                    {poll.isClosed && (
                      <span className="inline-block mt-2 bg-red-500 text-white px-4 py-1 rounded-full text-sm">
                        Votação Encerrada
                      </span>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {poll.options.map((option) => {
                      const isSelected = selectedOption[poll._id] === option.id;
                      const hasVotedForThis =
                        votedPolls[poll._id] === option.id;
                      const percentage = getPercentage(
                        option.votes ?? 0,
                        totalVotes
                      );

                      return (
                        <div
                          key={option.id}
                          className={`relative rounded-xl overflow-hidden transition-all ${
                            isSelected
                              ? "ring-4 ring-primary-500 transform scale-105"
                              : "hover:transform hover:scale-102"
                          } ${
                            hasVoted || poll.isClosed
                              ? "cursor-not-allowed opacity-80"
                              : "cursor-pointer"
                          }`}
                          onClick={() => {
                            if (!hasVoted && !poll.isClosed) {
                              setSelectedOption({
                                ...selectedOption,
                                [poll._id]: option.id,
                              });
                            }
                          }}
                        >
                          {/* Photo */}
                          <div className="aspect-square bg-gradient-radial from-primary-900 to-gray-900">
                            {option.photoUrl ? (
                              <img
                                src={toPublicMediaUrl(option.photoUrl)}
                                alt={option.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FaMusic className="text-6xl text-gray-600" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="p-4 bg-gray-900 bg-opacity-90">
                            <h3 className="font-semibold text-lg mb-2 flex items-center justify-between">
                              {option.name}
                              {hasVotedForThis && (
                                <FaCheckCircle className="text-green-500" />
                              )}
                            </h3>

                            {/* Music Player */}
                            {option.musicUrl && (
                              <MusicPlayer
                                url={toPublicMediaUrl(option.musicUrl)}
                                name={option.name}
                              />
                            )}

                            {/* Results */}
                            {canShowResults && (
                              <div className="mt-3">
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Votos: {option.votes ?? 0}</span>
                                  <span>{percentage}%</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Vote Button */}
                  {!hasVoted && !poll.isClosed && (
                    <div className="mt-8 text-center">
                      <button
                        onClick={() => handleVote(poll._id)}
                        disabled={!selectedOption[poll._id] || voting[poll._id]}
                        className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-12 py-4 rounded-full font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-2xl transition-all transform hover:scale-105 disabled:transform-none"
                      >
                        {voting[poll._id] ? (
                          <span className="flex items-center gap-2">
                            <FaSpinner className="animate-spin" />
                            Votando...
                          </span>
                        ) : (
                          "Confirmar Voto"
                        )}
                      </button>
                    </div>
                  )}

                  {hasVoted && (
                    <div className="mt-8 text-center">
                      <p className="text-green-500 flex items-center justify-center gap-2">
                        <FaCheckCircle />
                        Você já votou nesta enquete
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 py-8 mt-20">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} Canta Crisópolis. Todos os
            direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
