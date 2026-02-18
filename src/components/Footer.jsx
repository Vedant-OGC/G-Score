const Footer = () => {
    return (
        <footer className="mt-12 mb-8 px-4 text-center" id="footer">
            <div className="max-w-3xl mx-auto">
                <div className="h-px bg-gradient-to-r from-transparent via-[rgba(133,133,160,0.15)] to-transparent mb-6"></div>

                <p className="text-xs text-[var(--color-surface-400)] leading-relaxed max-w-2xl mx-auto mb-4">
                    This tool is based on the GITAM Deemed to be University Evaluation Policy 2025–26,
                    applicable from AY 2025–26. Results are for reference purposes only and do not guarantee accuracy.
                    Actual grades may vary. The creators of G-Marks are not accountable for any discrepancies.
                </p>

                <p className="text-xs text-[var(--color-surface-500)]">
                    © {new Date().getFullYear()} G-Marks • Built with ❤️ for GITAM students
                </p>
            </div>
        </footer>
    );
};

export default Footer;
