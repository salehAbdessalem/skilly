import { Link } from "@tanstack/react-router";
import { usePostHog } from "@posthog/react";
import { ArrowBigUp, ArrowUpRight, Bookmark, Check, Copy, MessageSquare } from "lucide-react";
import { useState } from "react";

const SkillCard = ({
	authorEmail,
	category,
	createdAt,
	description,
	installCommand,
	tags,
	title,
}: SKillRecord) => {
	const posthog = usePostHog();
	const [copied, setCopied] = useState(false);

	const handleOpen = () => posthog.capture("skill_opened");

	const handleCopy = async () => {
		try{
			await navigator.clipboard.writeText(installCommand);
			posthog.capture("skill_install_command_copied");
			posthog.logger.info("skill install command copied", {
				copy_method: "clipboard",
			});
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			setCopied(false);
		}
	};
	return (
		<article className="skill-card">
			<Link to="/skills" tabIndex={-1} aria-label={`Open ${title}`} className="overlay" onClick={handleOpen}/>
			<div className="chrome">
				<div className="chrome-bar">
					<div className="lights">
						<div className="light red" />
						<div className="light amber" />
						<div className="light green" />
					</div>
					<div className="host">Registry.sh</div>
				</div>
			</div>

			<div className="body">
				<div className="meta">
					<div className="author">
						<img src="/logo512.png" alt="Author avatar" className="avatar"/>
						<div className="author-copy">
							<p>Saleh</p>
							<p>{createdAt ? new Date(createdAt).toLocaleDateString() : "Unknown date"}</p>
						</div>
					</div>
					<p className="category">{category}</p>
				</div>
				<div className="summary">
					<Link to="/skills" className="title-link" onClick={handleOpen}>
						<h3>{title}</h3>
					</Link>
					<p>{description}</p>
				</div>

				<div className="command">
					<div className="command-copy">
						<span>{">_"}</span>
						<p>{installCommand}</p>
					</div>
					<button type="button" className="copy" onClick={handleCopy} aria-label="Copy to clipboard">
						{copied ? <Check size={16}/> : <Copy size={16} />}
					</button>
				</div>

				<div className="footer">
					<div className="stats">
						<button type="button" className="upvote" disabled>
							<ArrowBigUp size={16} />
							<span>{tags.length}</span>
						</button>
						<div className="comments">
							<MessageSquare size={14} />
							<span>{authorEmail ? 1 : 0}</span>
						</div>
					</div>

					<div className="actions">
						<Link to="/skills" className="open" title={`Open ${title}`} onClick={handleOpen}>
							<span>Open</span>
							<ArrowUpRight size={14} />
						</Link>

						<button type="button" className="save" aria-label="Saved state" disabled>
							<Bookmark size={16} />
						</button>
					</div>
				</div>
			</div>
		</article>
	);
};

export default SkillCard;
