"use client";

import { useState } from "react";
import {
  FaMusic,
  FaUser,
  FaSpinner,
  FaCheckCircle,
  FaArrowLeft,
} from "react-icons/fa";
import Link from "next/link";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(true);
        setFormData({
          firstName: "",
          lastName: "",
          phone: "",
          email: "",
          address: "",
          city: "",
          state: "",
          zipCode: "",
        });
      } else {
        const data = await response.json();
        setError(data.error || "Erro ao enviar inscrição");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError("Erro ao enviar inscrição. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <FaCheckCircle className="text-6xl mx-auto mb-6 text-green-500 animate-pulse" />
          <h1 className="text-3xl font-bold mb-4">Inscrição Enviada!</h1>
          <p className="text-gray-300 mb-8">
            Sua inscrição foi recebida com sucesso. Entraremos em contato em
            breve!
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/"
              className="bg-gradient-to-r from-primary-500 to-secondary-500 px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Voltar para Votações
            </Link>
            <button
              onClick={() => setSuccess(false)}
              className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Nova Inscrição
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-music py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <FaUser className="text-6xl mx-auto mb-6 animate-float" />
          <h1 className="text-5xl font-bold mb-4">Inscrição de Candidatos</h1>
          <p className="text-xl text-gray-200">
            Preencha o formulário abaixo para se inscrever no concurso
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 mb-6 transition-colors"
        >
          <FaArrowLeft />
          Voltar para votações
        </Link>

        <form
          onSubmit={handleSubmit}
          className="bg-gradient-stage rounded-2xl p-8 shadow-2xl"
        >
          {error && (
            <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium mb-2"
              >
                Nome *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium mb-2"
              >
                Sobrenome *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2">
                Telefone *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                E-mail *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="address" className="block text-sm font-medium mb-2">
              Endereço *
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Rua, número, complemento"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div>
              <label htmlFor="city" className="block text-sm font-medium mb-2">
                Cidade
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium mb-2">
                Estado
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="UF"
                maxLength={2}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all uppercase"
              />
            </div>

            <div>
              <label
                htmlFor="zipCode"
                className="block text-sm font-medium mb-2"
              >
                CEP
              </label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                placeholder="00000-000"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div className="bg-primary-900 bg-opacity-30 border border-primary-700 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-300">
              <strong>Atenção:</strong> Ao enviar este formulário, você concorda
              que seus dados sejam armazenados para fins de contato relacionados
              ao Canta Crisópolis.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-4 rounded-lg font-bold text-lg hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <FaSpinner className="animate-spin" />
                Enviando...
              </span>
            ) : (
              "Enviar Inscrição"
            )}
          </button>
        </form>
      </div>

      <footer className="bg-gray-900 py-8 mt-20">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-400">
          <p>&copy; 2025 Canta Crisópolis. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
