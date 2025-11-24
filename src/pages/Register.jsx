import { Link } from "react-router-dom";
import RegisterForm from "../components/auth/RegisterForm";

export default function Register() {
  return (
    <div className="mx-auto grid max-w-5xl gap-8 rounded-3xl bg-white/90 p-8 shadow-lg md:grid-cols-2">
      <div className="flex flex-col justify-center">
        <p className="text-sm uppercase tracking-wide text-blue-500">
          EduQA Campus
        </p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          Akademik topluluğa katıl
        </h1>
        <p className="mt-4 text-gray-600">
          Üniversite derslerinde aklına takılanları sor, deneyimini paylaş,
          kampüs arkadaşlarının çözümlerini takip et. Zaten hesabın varsa{" "}
          <Link to="/login" className="text-blue-600 underline">
            giriş yap
          </Link>
          .
        </p>
      </div>
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <RegisterForm variant="page" />
        <p className="mt-4 text-center text-sm text-gray-500">
          Kaydolarak topluluk kurallarını kabul etmiş olursun.
        </p>
      </div>
    </div>
  );
}