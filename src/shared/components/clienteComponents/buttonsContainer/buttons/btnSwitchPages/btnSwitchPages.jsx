function BtnSwitchPages({ direction, onClick, disabled }) {
  return (
    <button 
      className={`w-[85px] h-[31px] rotate-0 opacity-100 rounded border border-gray-200 flex items-center justify-center gap-2 cursor-pointer box-border bg-white text-gray-800 text-sm font-medium transition-colors ${
        disabled 
          ? 'opacity-50 cursor-not-allowed bg-gray-50' 
          : 'hover:bg-gray-50 hover:border-blue-500 active:bg-gray-100'
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {direction === "prev" ? "Anterior" : "Próximo"}
    </button>
  );
}

export default BtnSwitchPages;