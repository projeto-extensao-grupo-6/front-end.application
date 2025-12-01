import React from "react";
import {
  MapPin,
  FileText,
  Users,
  Calendar,
  Clock,
  MessageSquare,
} from "lucide-react";
import { getInitials } from "../utils/eventHelpers";

/**
 * Componente genérico para linha de informação
 */
export const EventInfoRow = ({ icon: Icon, title, content, className = "" }) => {
  if (!content) return null;

  return (
    <div className={`space-y-1 ${className}`}>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
        {Icon && <Icon size={14} />}
        {title}
      </p>
      <div className="text-sm font-medium text-gray-900 leading-relaxed">
        {content}
      </div>
    </div>
  );
};

/**
 * Cabeçalho do modal de detalhes
 */
export const EventHeader = ({ title, badges, onClose }) => {
  return (
    <div className="relative bg-white px-8 py-6 border-b border-gray-100">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition"
        aria-label="Fechar"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M15 5L5 15M5 5l10 10" />
        </svg>
      </button>
      
      <div className="pr-10">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
          Agendamento
        </p>
        <h2 className="text-2xl font-bold text-gray-900">
          {title || "Sem título"}
        </h2>
        
        {badges && badges.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {badges.map((badge, index) => (
              <span
                key={index}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${badge.className}`}
              >
                {badge.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Informações principais do evento
 */
export const EventInfo = ({ date, startTime, endTime, pedido, endereco, cep }) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-8 w-full">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Data
          </p>
          <p className="text-base font-semibold text-gray-900">{date}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Horário
          </p>
          <p className="text-base font-semibold text-gray-900">
            {startTime} - {endTime}
          </p>
        </div>
      </div>

      <div className="border-t border-gray-100"></div>

      <EventInfoRow
        icon={FileText}
        title="Pedido Vinculado"
        content={pedido}
      />

      <div className="space-y-1">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
          <MapPin size={14} />
          Localização
        </p>
        <p className="text-sm font-medium text-gray-900 leading-relaxed">
          {endereco}
        </p>
        {cep && (
          <p className="text-xs text-gray-500 mt-2.5">CEP: {cep}</p>
        )}
      </div>
    </>
  );
};

/**
 * Equipe/Funcionários do evento
 */
export const EventTeam = ({ funcionarios }) => {
  if (!funcionarios || funcionarios.length === 0) {
    return (
      <div className="space-y-2.5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
          <Users size={14} />
          Equipe Responsável
        </p>
        <p className="text-sm text-gray-500">Nenhum funcionário atribuído</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
        <Users size={14} />
        Equipe Responsável
      </p>
      <div className="flex flex-wrap gap-2.5">
        {funcionarios.map((func, idx) => {
          const nome = func.label || func.nome || func;
          return (
            <div
              key={idx}
              className="inline-flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-full px-3.5 py-1.5 text-sm font-medium text-gray-700"
            >
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">
                {getInitials(nome)}
              </div>
              <span className="truncate">{nome}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Observações do evento
 */
export const EventObservations = ({ observacao }) => {
  if (!observacao) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
        <MessageSquare size={14} />
        Observações
      </p>
      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 p-3.5 rounded-lg border border-gray-100">
        {observacao}
      </p>
    </div>
  );
};

/**
 * Rodapé com ações do modal
 */
export const EventFooter = ({
  onDelete,
  onViewMap,
  isDeleting,
  isLoading,
  hasAddress,
}) => {
  return (
    <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
      <button
        onClick={onDelete}
        disabled={isLoading || isDeleting}
        className="px-5 py-2.5 rounded-lg font-medium text-red-600 hover:bg-red-50 border border-red-200 hover:border-red-300 text-sm disabled:opacity-50 transition-colors"
      >
        Excluir
      </button>
      <button
        onClick={onViewMap}
        disabled={!hasAddress || isLoading}
        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg font-medium text-sm disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        <MapPin size={16} />
        Ver no Mapa
      </button>
    </div>
  );
};

/**
 * Indicador de carregamento
 */
export const LoadingState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <svg
        className="animate-spin h-10 w-10 text-gray-400 mb-3"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <span className="text-gray-500 text-sm font-medium">Carregando...</span>
    </div>
  );
};

/**
 * Mensagem de erro
 */
export const ErrorMessage = ({ message }) => {
  if (!message) return null;

  return (
    <div className="p-4 bg-red-50 text-red-700 border border-red-100 rounded-lg text-sm font-medium flex items-center gap-2">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
      {message}
    </div>
  );
};
